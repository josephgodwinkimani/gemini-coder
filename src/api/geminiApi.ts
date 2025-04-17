import { GoogleGenAI } from "@google/genai";
import { Message, GeminiModel } from '../types/types';

class GeminiApi {
    private apiKey: string;
    private genAI: any = null;

    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.initializeClient();
    }

    private initializeClient() {
        if (!this.apiKey) return;

        try {
            this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
        } catch (error) {
            console.error('Failed to initialize Gemini client:', error);
            this.genAI = null;
        }
    }

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        localStorage.setItem('gemini_api_key', apiKey);
        this.initializeClient();
        return !!this.genAI;
    }

    getApiKey() {
        return this.apiKey;
    }

    async listModels(): Promise<{ models: GeminiModel[] }> {
        if (!this.genAI) {
            throw new Error('API key not set or client not initialized');
        }

        const models: GeminiModel[] = [
            { name: 'gemini-2.5-pro-preview-03-25', displayName: 'Gemini 2.5 Pro Preview', description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more' },
            { name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', description: 'Next generation features, speed, thinking, realtime streaming, and multimodal generation' },
            { name: 'gemini-2.0-flash-lite', displayName: 'Gemini 2.0 Flash Lite', description: 'Cost efficiency and low latency' },
            { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', description: 'Fast and versatile performance across a diverse variety of tasks' },
            { name: 'gemini-1.5-flash-8b', displayName: 'Gemini 1.5 Flash 8B', description: 'High volume and lower intelligence tasks' },
            { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Complex reasoning tasks requiring more intelligence' },
        ];

        return { models };
    }

    // Extract content for system message if present
    private extractSystemInstruction(messages: Message[]): string | undefined {
        const systemMessage = messages.find(message => message.role === 'system');
        return systemMessage?.content;
    }

    // Format chat messages to the content format expected by the API
    private formatMessagesToContents(messages: Message[]) {
        return messages
            .filter(message => message.role !== 'system')
            .map(message => ({
                role: message.role === 'user' ? 'user' : 'model',
                parts: [{ text: message.content }],
            }));
    }

    async chat(modelName: string, messages: Message[], options: any = {}) {
        if (!this.genAI) {
            throw new Error('API key not set or client not initialized');
        }

        try {
            const systemInstruction = this.extractSystemInstruction(messages);

            const contents = this.formatMessagesToContents(messages);

            const config = {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 2048,
                systemInstruction: systemInstruction,
            };

            const response = await this.genAI.models.generateContent({
                model: modelName ?? 'gemini-2.0-flash',
                contents,
                generationConfig: config,
            });

            // Extract text content from response based on its structure
            let responseText = '';

            try {
                // try using the text() function if available
                if (response.response && typeof response.response.text === 'function') {
                    responseText = response.response.text();
                }
                // Access the raw response structure
                else if (response.candidates && Array.isArray(response.candidates)) {
                    // Extract text from candidates array
                    for (const candidate of response.candidates) {
                        if (candidate.content && candidate.content.parts) {
                            for (const part of candidate.content.parts) {
                                if (part.text) {
                                    responseText += part.text;
                                }
                            }
                        }
                    }
                }

                else if (response.content && response.content.parts) {
                    for (const part of response.content.parts) {
                        if (part.text) {
                            responseText += part.text;
                        }
                    }
                }
                // Raw response object without structure
                else if (typeof response === 'object') {
                    console.log('Response structure:', JSON.stringify(response));

                    // Find text in the response object
                    const findTextInObject = (obj: any): string => {
                        if (!obj || typeof obj !== 'object') return '';

                        if (obj.text && typeof obj.text === 'string') return obj.text;

                        let result = '';
                        for (const key in obj) {
                            if (key === 'text' && typeof obj[key] === 'string') {
                                result += obj[key];
                            } else if (typeof obj[key] === 'object') {
                                result += findTextInObject(obj[key]);
                            }
                        }
                        return result;
                    };

                    responseText = findTextInObject(response);
                }
            } catch (extractError) {
                console.error('Error extracting text from response:', extractError);
                console.log('Raw response:', response);
                throw new Error('Failed to extract text from response');
            }

            return {
                message: {
                    role: 'assistant',
                    content: responseText,
                },
            };
        } catch (error) {
            console.error('Error during chat with Gemini:', error);
            throw error;
        }
    }

    async streamChat(modelName: string, messages: Message[], options: any = {}, onChunk: (chunk: string) => void) {
        if (!this.genAI) {
            throw new Error('API key not set or client not initialized');
        }

        try {
            const systemInstruction = this.extractSystemInstruction(messages);

            const contents = this.formatMessagesToContents(messages);

            const config = {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 2048,
                systemInstruction: systemInstruction,
            };

            const result = await this.genAI.models.generateContentStream({
                model: modelName ?? 'gemini-2.0-flash',
                contents,
                generationConfig: config,
            });

            let fullText = '';

            try {
                for await (const chunk of result) {
                    try {
                        let chunkText = '';

                        if (chunk.text && typeof chunk.text === 'function') {
                            chunkText = chunk.text();
                        }

                        else if (chunk.candidates && Array.isArray(chunk.candidates)) {
                            for (const candidate of chunk.candidates) {
                                if (candidate.content && candidate.content.parts) {
                                    for (const part of candidate.content.parts) {
                                        if (part.text) {
                                            chunkText += part.text;
                                        }
                                    }
                                }
                            }
                        }

                        else if (chunk.parts && Array.isArray(chunk.parts)) {
                            for (const part of chunk.parts) {
                                if (part.text) {
                                    chunkText += part.text;
                                }
                            }
                        }

                        if (chunkText) {
                            fullText += chunkText;
                            onChunk(chunkText);
                        }
                    } catch (chunkError) {
                        console.warn('Error processing chunk:', chunkError);
                        // Continue processing even if one chunk fails
                    }
                }
            } catch (streamError) {
                console.error('Stream processing error:', streamError);
                // If we have partial content already, don't throw error
                if (!fullText) {
                    throw streamError;
                }
            }

            return {
                message: {
                    role: 'assistant',
                    content: fullText,
                },
            };
        } catch (error) {
            console.error('Error during streaming chat with Gemini:', error);
            throw error;
        }
    }
}

export const geminiApi = new GeminiApi();