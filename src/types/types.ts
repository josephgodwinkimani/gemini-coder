export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  waitTime?: string;
}

export interface Model {
  name: string;
  displayName?: string;
  description?: string;
}

// Extended model interface for Gemini models with additional information
export interface GeminiModel extends Model {
  displayName: string;
  description: string;
}

export interface ChatEntry {
  id: string | number;
  timestamp: string;
  title: string;
  messages: Message[];
  model: string;
}

export interface ChatHistory {
  id: string;
  timestamp: string;
  title: string;
  messages: Message[];
  model: string;
}