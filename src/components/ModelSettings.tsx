import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface ModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ModelSettingsInterface) => void;
  initialSettings: ModelSettingsInterface;
}

export interface ModelSettingsInterface {
  temperature: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<ModelSettingsInterface>({
    temperature: initialSettings?.temperature || 0.7,
    topK: initialSettings?.topK || 40,
    topP: initialSettings?.topP || 0.95,
    maxOutputTokens: initialSettings?.maxOutputTokens || 2048,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = () => {
    onSave(settings);
    showToast('Model settings saved!', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="model-settings">
        <h2>Model Settings</h2>

        <div className="settings-group">
          <label>
            Temperature
            <div className="setting-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
              />
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="setting-description">
              Controls randomness: 0 is focused, 1 is more creative
            </div>
          </label>
        </div>

        <div className="advanced-toggle">
          <button
            type="button"
            className="toggle-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-settings">
            <div className="settings-group">
              <label>
                Top K
                <div className="setting-control">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={settings.topK}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        topK: parseInt(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={settings.topK}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        topK: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="setting-description">
                  Limits token selection to top K most likely tokens
                </div>
              </label>
            </div>

            <div className="settings-group">
              <label>
                Top P
                <div className="setting-control">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.topP}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        topP: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.topP}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        topP: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="setting-description">
                  Cumulative probability cutoff for token selection
                </div>
              </label>
            </div>

            <div className="settings-group">
              <label>
                Max Output Tokens
                <div className="setting-control">
                  <input
                    type="range"
                    min="100"
                    max="8192"
                    step="100"
                    value={settings.maxOutputTokens}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        maxOutputTokens: parseInt(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="number"
                    min="100"
                    max="8192"
                    step="100"
                    value={settings.maxOutputTokens}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        maxOutputTokens: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="setting-description">
                  Maximum number of tokens to generate in the response
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="settings-info">
          <p>
            <strong>Note:</strong> Adjusting these parameters affects how the model generates
            responses. Higher temperature produces more creative but potentially less factual
            responses.
          </p>
        </div>

        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};
