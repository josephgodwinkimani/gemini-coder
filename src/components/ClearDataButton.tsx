import React, { useState } from 'react';

interface ClearDataButtonProps {
  onClear: () => void;
}

export const ClearDataButton: React.FC<ClearDataButtonProps> = ({ onClear }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTimer, setConfirmTimer] = useState<number | null>(null);

  const handleInitialClick = () => {
    setShowConfirm(true);

    // Auto-hide confirmation after 5 seconds
    const timerId = window.setTimeout(() => {
      setShowConfirm(false);
    }, 5000);

    setConfirmTimer(timerId);
  };

  const handleConfirmClick = () => {
    if (confirmTimer) {
      clearTimeout(confirmTimer);
    }
    setShowConfirm(false);
    onClear();
  };

  const handleCancelClick = () => {
    if (confirmTimer) {
      clearTimeout(confirmTimer);
    }
    setShowConfirm(false);
  };

  return (
    <div className="header-info">
      {!showConfirm ? (
        <button onClick={handleInitialClick} className="clear-data-button">
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
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Clear Data
        </button>
      ) : (
        <div className="clear-confirmation">
          <div className="confirmation-info">
            <p>Do you wish to clear your chat messages, model and model settings ?</p>
          </div>
          <div className="confirmation-buttons">
            <button onClick={handleConfirmClick} className="confirm-clear-button">
              Confirm Clear
            </button>
            <button onClick={handleCancelClick} className="cancel-clear-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
