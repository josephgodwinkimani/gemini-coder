import React, { useState, useEffect } from 'react';

interface SystemMessageInputProps {
    onSystemMessageChange: (message: string) => void;
    initialMessage?: string;
}

export const SystemMessageInput: React.FC<SystemMessageInputProps> = ({
    onSystemMessageChange,
    initialMessage = '',
}) => {
    const [expanded, setExpanded] = useState(false);
    const [systemMessage, setSystemMessage] = useState(initialMessage);

    useEffect(() => {
        // When the component loads, notify parent if there's an initial message
        if (initialMessage) {
            onSystemMessageChange(initialMessage);
        }
    }, [initialMessage, onSystemMessageChange]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const message = e.target.value;
        setSystemMessage(message);
        onSystemMessageChange(message);
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const handleClear = () => {
        setSystemMessage('');
        onSystemMessageChange('');
    };

    return (
        <div className="system-message-container">
            <div className="system-message-header" onClick={toggleExpanded}>
                <div className="header-title">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                    <span>System Instructions</span>
                </div>
                <div className="toggle-indicator">
                    {expanded ? '▼' : '▶'}
                </div>
            </div>

            {expanded && (
                <div className="system-message-content">
                    <textarea
                        value={systemMessage}
                        onChange={handleChange}
                        placeholder="Enter system instructions to guide the model's behavior..."
                        rows={5}
                        className="system-message-textarea"
                    />
                    <div className="system-message-actions">
                        <button
                            onClick={handleClear}
                            className="clear-button"
                            disabled={!systemMessage}
                        >
                            Clear
                        </button>
                        <div className="message-info">
                            System instructions help guide the model's behavior without appearing in the conversation.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};