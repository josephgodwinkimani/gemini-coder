import React, { useState, useEffect } from 'react';
import { geminiApi } from '../api/geminiApi';
import { useToast } from '../context/ToastContext';

interface ApiKeyInputProps {
  onApiKeySet: (isSet: boolean) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [keyStatus, setKeyStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const { showToast } = useToast();

  useEffect(() => {
    const savedKey = geminiApi.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setKeyStatus('valid');
      onApiKeySet(true);
    }
  }, [onApiKeySet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      showToast('Please enter a valid API key', 'error');
      return;
    }

    const success = geminiApi.setApiKey(apiKey.trim());

    if (success) {
      setKeyStatus('valid');
      showToast('API key saved successfully', 'success');
      onApiKeySet(true);
    } else {
      setKeyStatus('invalid');
      showToast('Invalid API key format', 'error');
      onApiKeySet(false);
    }
  };

  const handleClear = () => {
    geminiApi.setApiKey('');
    setApiKey('');
    setKeyStatus('none');
    showToast('API key cleared', 'success');
    onApiKeySet(false);
  };

  return (
    <div className="api-key-container">
      <form onSubmit={handleSubmit} className="api-key-form">
        <div className="api-key-label">
          <span>Gemini API Key</span>
          {keyStatus === 'valid' && <span className="api-key-status valid">✓ Valid key saved</span>}
          {keyStatus === 'invalid' && (
            <span className="api-key-status invalid">✗ Invalid key format</span>
          )}
        </div>
        <div className="api-key-input-group">
          <input
            type={isHidden ? 'password' : 'text'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="api-key-field"
          />
          <button
            type="button"
            onClick={() => setIsHidden(!isHidden)}
            className="toggle-visibility-button"
            title={isHidden ? 'Show API key' : 'Hide API key'}
          >
            {isHidden ? '👁️' : '🔒'}
          </button>
        </div>
        <div className="api-key-actions">
          <button type="submit" className="save-key-button">
            Save Key
          </button>
          {keyStatus === 'valid' && (
            <button type="button" onClick={handleClear} className="clear-key-button">
              Clear Key
            </button>
          )}
        </div>
      </form>
      <div className="api-key-info">
        <p>
          To use this application, you need a Gemini API key.
          <br />
          Get your key from the{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
};
