import { Message, ChatEntry } from '../types/types';

class StorageService {
  private readonly STORAGE_KEY = 'gemini-chats';

  async saveChat(
    messages: Message[],
    model: string,
    chatEntry: ChatEntry
  ): Promise<void> {
    try {
      // Load existing chats
      const existingChats = this.loadChatsFromStorage();

      // Filter out the chat with the same ID if it exists
      const filteredChats = existingChats.filter(
        chat => chat.id !== chatEntry.id
      );

      // Add the new/updated chat
      const updatedChats = [...filteredChats, chatEntry];

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error;
    }
  }

  async loadChat(chatId: string | number): Promise<ChatEntry | null> {
    try {
      const chats = this.loadChatsFromStorage();
      return chats.find(chat => chat.id === chatId) || null;
    } catch (error) {
      console.error('Error loading chat:', error);
      return null;
    }
  }

  async deleteChat(chatId: string | number): Promise<void> {
    try {
      const chats = this.loadChatsFromStorage();
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  async loadAllChats(): Promise<ChatEntry[]> {
    return this.loadChatsFromStorage();
  }

  private loadChatsFromStorage(): ChatEntry[] {
    try {
      const storedChats = localStorage.getItem(this.STORAGE_KEY);
      if (!storedChats) {
        return [];
      }
      return JSON.parse(storedChats);
    } catch (error) {
      console.error('Error parsing stored chats:', error);
      return [];
    }
  }

  clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storageService = new StorageService();