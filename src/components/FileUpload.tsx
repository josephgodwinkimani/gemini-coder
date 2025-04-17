import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileContent }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [
    '.bash',
    '.sh', // Bash
    '.c', // C
    '.cpp',
    '.cc',
    '.h', // C++
    '.cs', // C#
    '.css', // CSS
    'Dockerfile', // Docker
    '.go', // Go
    '.graphql',
    '.gql', // GraphQL
    '.java', // Java
    '.js',
    '.jsx', // JavaScript
    '.json', // JSON
    '.kt',
    '.kts', // Kotlin
    '.tex', // LaTeX
    '.md',
    '.markdown', // Markdown
    '.m',
    '.mat', // MATLAB
    '.pl',
    '.pm', // Perl
    '.php', // PHP
    '.py', // Python
    '.r', // R
    '.rb', // Ruby
    '.rs', // Rust
    '.scala',
    '.sc', // Scala
    '.sql', // SQL
    '.swift', // Swift
    '.ts',
    '.tsx', // TypeScript
    '.yml',
    '.yaml', // YAML
    '.txt', // Plain text
    '.scss',
    '.sass', // SASS/SCSS
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      setError(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError('File size must be less than 5MB');
      return false;
    }
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const content = await file.text();
      setError('');
      setSelectedFile(file.name);
      onFileContent(content, file.name);
    } catch (err) {
      setError('Error reading file. Please try again.');
      console.error('Error reading file:', err);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file selection
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
    onFileContent('', ''); // Clear file content
  };

  return (
    <div className="file-upload-container">
      {selectedFile ? (
        <div className="selected-file">
          <div className="file-info">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <span className="filename">{selectedFile}</span>
          </div>
          <button className="remove-file" onClick={handleRemoveFile} title="Remove file">
            ×
          </button>
        </div>
      ) : (
        <div
          className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept={allowedExtensions.join(',')}
            style={{ display: 'none' }}
          />
          <div className="file-upload-content">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drag and drop your code file here or click to browse</p>
            <p className="file-types">Supported files: {allowedExtensions.join(', ')}</p>
          </div>
        </div>
      )}
      {error && <div className="file-upload-error">{error}</div>}
    </div>
  );
};
