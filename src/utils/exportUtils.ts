import { ChatHistory } from '../types/types';

export const exportChatHistories = (chatHistories: ChatHistory[]): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `chat-histories-${timestamp}.json`;
  const data = JSON.stringify(chatHistories, null, 2);

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
