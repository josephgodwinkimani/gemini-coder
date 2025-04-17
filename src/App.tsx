import { useEffect, useState } from 'react';
import { geminiApi } from './api/geminiApi';
import './App.css';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { ClearDataButton } from './components/ClearDataButton';
import { FileUpload } from './components/FileUpload';
import { ModelSelector } from './components/ModelSelector';
import { ModelSettingsInterface } from './components/ModelSettings';
import { WaitingIndicator } from './components/WaitingIndicator';
import { ToastProvider } from './context/ToastContext';
import { storageService } from './services/StorageService';
import { ChatEntry, ChatHistory, Message, Model } from './types/types';
import { modelStorage } from './utils/modelStorage';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import { ExportButton } from './components/ExportButton';
import { exportChatHistories } from './utils/exportUtils';
import { ImportButton } from './components/ImportButton';
import { SystemMessageInput } from './components/SystemMessageInput';

function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelSettings, setModelSettings] = useState({
    temperature: 0.7,
    numCores: 4,
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || '';
  });
  const [fileContent, setFileContent] = useState('');
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [waitStartTime, setWaitStartTime] = useState<number | null>(null);
  const [waitEndTime, setWaitEndTime] = useState<number | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(uuidv4());
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamedContent, setStreamedContent] = useState('');

  const handleSystemMessageChange = (message: string) => {
    setSystemMessage(message);
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = formatDateTime(now);
      setDateTime(formattedDate);
    };

    updateDateTime();
    const timeInterval = setInterval(updateDateTime, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    // Check if API key is already set
    const apiKey = geminiApi.getApiKey();
    setIsApiKeySet(!!apiKey);

    if (apiKey) {
      initialize();
    }
  }, [isApiKeySet]);

  const initialize = async () => {
    await loadModels();
    loadModelSettings();
    await loadChatHistory();
  };

  const loadModels = async () => {
    try {
      const response = await geminiApi.listModels();
      setModels(response?.models as Model[]);

      // Validate saved model against available models
      const validModel = modelStorage.validateSavedModel(response.models.map(m => m.name));
      setSelectedModel(validModel);
    } catch (error) {
      console.error('Error fetching models:', error);
      modelStorage.clearModel();
      setSelectedModel('');
    }
  };

  const handleSettingsChange = (settings: ModelSettingsInterface) => {
    setModelSettings(settings);
    // Save settings to localStorage
    localStorage.setItem('modelSettings', JSON.stringify(settings));
  };

  const formatDateTime = (date: Date): string => {
    const pad = (num: number): string => num.toString().padStart(2, '0');

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const loadModelSettings = () => {
    const savedSettings = localStorage.getItem('modelSettings');
    if (savedSettings) {
      setModelSettings(JSON.parse(savedSettings));
    }
  };

  const loadChatHistory = async () => {
    try {
      const histories = await storageService.loadAllChats();
      if (!Array.isArray(histories)) {
        console.error('Invalid chat histories format');
        return;
      }

      const historiesWithTitles = histories
        .filter(chat => chat && typeof chat === 'object')
        .map(chat => ({
          ...chat,
          id: String(chat.id || uuidv4()),
          title: getFirstQuestionPreview(Array.isArray(chat.messages) ? chat.messages : []),
        }));

      setChatHistories(historiesWithTitles);

      // Load latest chat if exists
      const latestChat = historiesWithTitles[historiesWithTitles.length - 1];
      if (latestChat && Array.isArray(latestChat.messages)) {
        setMessages(latestChat.messages);
        setSelectedModel(latestChat.model || '');
        setCurrentChatId(latestChat.id);
      }
    } catch (error) {
      console.error('Error loading chat histories:', error);
      setChatHistories([]);
    }
  };

  const handleFileContent = (content: string, filename: string) => {
    // Create a message with the file content
    const fileMessage = `Using this file named "${filename}" with the content:\n\`\`\`${filename}\n${content}\n\`\`\`\n`;
    setFileContent(fileMessage);
  };

  const calculateWaitTime = (startTime: number, endTime: number): string => {
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedModel || !content || !isApiKeySet) return;

    // Combine user message with file content if available
    const messageContent = fileContent ? `${fileContent}\n\n${content}` : content;

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    const startTime = Date.now();
    setWaitStartTime(startTime);
    setStreamedContent('');

    try {
      // For streaming mode
      if (isStreaming) {
        // Create an interim message that will be updated during streaming
        const interimMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };

        // Add the interim message to the chat
        setMessages([...updatedMessages, interimMessage]);

        let responseText = '';

        // Prep the complete set of messages including system message if present
        const messagesToSend = systemMessage
          ? [{ role: 'system', content: systemMessage }, ...updatedMessages]
          : updatedMessages;

        await geminiApi.streamChat(
          selectedModel,
          messagesToSend,
          {
            temperature: modelSettings?.temperature,
            topK: modelSettings?.topK || 40,
            topP: modelSettings?.topP || 0.95,
            maxOutputTokens: modelSettings?.maxOutputTokens || 2048,
          },
          (chunk: string) => {
            // Update the streamed content with each chunk
            responseText += chunk;

            // updte the interim message with the accumulated content
            // We need to create a new object to trigger a state update
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: responseText
              };
              return newMessages;
            });
          }
        );

        const endTime = Date.now();
        const waitTime = calculateWaitTime(startTime, endTime);

        // create the final message with the complete response
        const assistantMessage: Message = {
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
          waitTime,
        };

        setMessages([...updatedMessages, assistantMessage]);

        // Save the chat history
        await saveChatHistory(updatedMessages.concat(assistantMessage), selectedModel);

      } else {
        // Non-streaming mode
        const messagesToSend = systemMessage
          ? [{ role: 'system', content: systemMessage }, ...updatedMessages]
          : updatedMessages;

        const response = await geminiApi.chat(selectedModel, messagesToSend, {
          temperature: modelSettings?.temperature,
          topK: modelSettings?.topK || 40,
          topP: modelSettings?.topP || 0.95,
          maxOutputTokens: modelSettings?.maxOutputTokens || 2048,
        });

        const endTime = Date.now();
        const waitTime = calculateWaitTime(startTime, endTime);

        const assistantMessage: Message = {
          ...response.message,
          timestamp: new Date().toISOString(),
          waitTime,
        };

        const newMessages = [...updatedMessages, assistantMessage];
        setMessages(newMessages);

        await saveChatHistory(newMessages, selectedModel);
      }

      // Play success sound
      const audio: HTMLAudioElement = new Audio('/sounds/notification-sound-3-262896.mp3');
      audio.play();
    } catch (error) {
      console.error('Error sending message:', error);

      // Error message to the chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error generating a response. Please try again or check your API key.',
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, errorMessage]);

      // Play error sound
      const audio: HTMLAudioElement = new Audio('/sounds/windows-error-sound-effect-35894.mp3');
      audio.play();
    } finally {
      setIsLoading(false);
      setWaitStartTime(null);
      setWaitEndTime(null);
    }
  };

  const saveChatHistory = async (newMessages: Message[], model: string) => {
    const chatHistory: ChatHistory = {
      id: currentChatId,
      title: getFirstQuestionPreview(newMessages),
      messages: newMessages,
      model: model,
      timestamp: new Date().toISOString(),
    };

    const chatEntry: ChatEntry = {
      ...chatHistory,
      id: currentChatId,
    };

    await storageService.saveChat(chatHistory.messages, chatHistory.model, chatEntry);
    setChatHistories(prev => [...prev.filter(ch => ch.id !== currentChatId), chatHistory]);
  };

  const getFirstQuestionPreview = (messages: Message[]): string => {
    const firstQuestion = messages.find(m => m.role === 'user')?.content || '';
    const words = firstQuestion.split(' ').slice(0, 10).join(' ');
    return words + (firstQuestion.split(' ').length > 10 ? '...' : '');
  };

  const handleChatSelect = (selectedOption: { value: string; label: string } | null) => {
    if (!selectedOption) return;

    const selectedChat = chatHistories.find(ch => ch.id === selectedOption.value);
    if (selectedChat) {
      setMessages(selectedChat.messages);
      setSelectedModel(selectedChat.model);
      setCurrentChatId(selectedChat.id);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(uuidv4());
  };

  const handleClearAll = () => {
    // Clear message
    setMessages([]);

    // Clear model selection
    setSelectedModel('');
    modelStorage.clearModel();

    // Reset model settings to defaults
    const defaultSettings = {
      temperature: 0.7,
      numCores: 4,
    };
    setModelSettings(defaultSettings);

    // Clear localStorage
    localStorage.removeItem('modelSettings');
    localStorage.removeItem('selectedModel');
    storageService.clearStorage();

    // Clear file content if any
    setFileContent('');
    setChatHistories([]);
    setCurrentChatId(uuidv4());
  };

  const handleExport = () => {
    if (chatHistories.length > 0) {
      exportChatHistories(chatHistories);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const fileContent: string = await file.text();
      const importedHistories: ChatHistory[] = JSON.parse(fileContent) as ChatHistory[];

      if (!Array.isArray(importedHistories)) {
        throw new Error('Invalid chat history format');
      }

      // Validate and process imported histories
      const validHistories: ChatHistory[] = importedHistories
        .filter(
          chat =>
            chat &&
            typeof chat === 'object' &&
            Array.isArray(chat.messages) &&
            typeof chat.model === 'string'
        )
        .map(chat => ({
          ...chat,
          id: uuidv4(), // Generate new IDs to avoid conflicts
          timestamp: chat.timestamp || new Date().toISOString(),
        }));

      if (validHistories.length === 0) {
        throw new Error('No valid chat histories found in file');
      }

      // Merge with existing histories
      setChatHistories(prev => [...prev, ...validHistories]);

      // Save merged histories to storage
      const allHistories: ChatHistory[] = [...chatHistories, ...validHistories];
      localStorage.setItem('gemini-chats', JSON.stringify(allHistories));

      // Update current chat to the first imported chat
      const firstImported = validHistories[0];
      setMessages(firstImported.messages);
      setSelectedModel(firstImported.model);
      setCurrentChatId(firstImported.id);
    } catch (error) {
      console.error('Error importing chat histories:', error);
    }
  };

  const handleToggleStreaming = () => {
    setIsStreaming(!isStreaming);
    localStorage.setItem('streaming_enabled', (!isStreaming).toString());
  };

  const handleApiKeySet = (isSet: boolean) => {
    setIsApiKeySet(isSet);
    if (isSet) {
      initialize();
    }
  };

  return (
    <ToastProvider>
      <div className="app-container">
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <img src="/images/gemini-color.png" alt="Gemini Logo" className="logo-image" />
              <span className="logo-text">GeminiCoder</span>
            </a>
          </div>
          <div className="header-info">
            <div className="info-line" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Select
                value={
                  chatHistories.length > 0
                    ? {
                      value: currentChatId,
                      label:
                        chatHistories.find(ch => ch.id === currentChatId)?.title || 'New Chat',
                    }
                    : null
                }
                onChange={handleChatSelect}
                options={chatHistories.map(chat => ({
                  value: chat.id,
                  label: chat.title,
                }))}
                placeholder="Select chat history..."
                styles={{
                  container: base => ({
                    ...base,
                    minWidth: '300px',
                  }),
                }}
              />
              <button onClick={handleNewChat} className="new-chat-button">
                New Chat
              </button>
              <ExportButton onExport={handleExport} disabled={chatHistories.length === 0} />
              <ImportButton onImport={handleImport} />
              <ClearDataButton onClear={handleClearAll} />
            </div>
          </div>
        </header>

        <main className="main-content">
          {!isApiKeySet ? (
            <div className="api-key-setup">
              <h2>Welcome to GeminiCoder</h2>
              <p>An interactive code analysis and assistant interface for Google Gemini AI.</p>
              <ApiKeyInput onApiKeySet={handleApiKeySet} />
            </div>
          ) : (
            <div className="chat-container">
              <div className="model-selector">
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onSettingsChange={handleSettingsChange}
                />
                <SystemMessageInput
                  onSystemMessageChange={handleSystemMessageChange}
                  initialMessage=""
                />
                <div className="streaming-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={isStreaming}
                      onChange={handleToggleStreaming}
                    />
                    Streaming mode
                  </label>
                </div>
                <FileUpload onFileContent={handleFileContent} />
              </div>

              <div className="chat-messages">
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    Start a conversation by sending a message
                  </div>
                )}
                <WaitingIndicator isWaiting={isLoading} startTime={waitStartTime} />
              </div>

              <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;