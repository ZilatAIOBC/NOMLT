import React, { useRef, useState } from 'react';
import { Upload, X, Music } from 'lucide-react';

interface AudioUploadProps {
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  placeholder?: string;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ file, onFileChange, placeholder }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type.includes('mp3') || droppedFile.type.includes('wav'))) {
      onFileChange && onFileChange(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && onFileChange) {
      onFileChange(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    onFileChange && onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10'
            : file
            ? 'border-gray-600 bg-gray-800/50'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              <Music className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">
              You can drag and drop a file or click to upload
            </p>
          </div>
        )}
      </div>

      {/* Placeholder URL Display */}
      {!file && placeholder && (
        <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-600">
          <Music className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 truncate">{placeholder}</span>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;

