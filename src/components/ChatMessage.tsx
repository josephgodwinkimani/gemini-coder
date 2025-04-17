import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Message } from '../types/types';
import { formatMessage } from '../utils/messageFormatter';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { showToast } = useToast();
  const [copying, setCopying] = useState(false);
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';

  const handleCopyResponse = async () => {
    if (copying) return;

    try {
      setCopying(true);
      await navigator.clipboard.writeText(message.content);
      showToast('Response copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy response:', err);
      showToast('Failed to copy response', 'error');
    } finally {
      setCopying(false);
      // Reset copying state after animation
      setTimeout(() => setCopying(false), 1000);
    }
  };

  return (
    <div className={`message ${message?.role}`}>
      <div className="message-header">
        <div className="message-info">
          <span className="message-role">{message?.role === 'user' ? 'You' : 'Assistant'}</span>
          {message.waitTime && message?.role === 'assistant' && (
            <span className="wait-time" title={`Response took ${message?.waitTime}`}>
              Response time: {message?.waitTime}
            </span>
          )}
          {timestamp && <span className="timestamp">{timestamp}</span>}
        </div>
        {message.role === 'assistant' && (
          <button
            className={`copy-response-button ${copying ? 'copying' : ''}`}
            onClick={handleCopyResponse}
            title="Copy entire response"
            disabled={copying}
          >
            {copying ? (
              <svg
                className="copy-success-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
            {copying ? 'Copied!' : 'Copy Response'}
          </button>
        )}
      </div>
      <div
        className="message-content markdown-content"
        dangerouslySetInnerHTML={{ __html: formatMessage(message?.content) }}
      />
    </div>
  );
};
