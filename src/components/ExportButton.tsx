import React from 'react';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, disabled }) => {
  return (
    <button
      onClick={onExport}
      className="export-button"
      disabled={disabled}
      title="Export chat histories"
    >
      Export Chats
    </button>
  );
};
