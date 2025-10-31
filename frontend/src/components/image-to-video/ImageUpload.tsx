import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  // Single-file mode (backward compatible)
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  // Multi-file mode
  multiple?: boolean;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ file, onFileChange, multiple = false, files = [], onFilesChange, placeholder }) => {
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
    if (multiple) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (droppedFiles.length && onFilesChange) {
        const merged = [...files, ...droppedFiles];
        onFilesChange(merged);
      }
    } else {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type.startsWith('image/')) {
        onFileChange && onFileChange(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (multiple) {
      const chosen = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
      if (chosen.length && onFilesChange) {
        onFilesChange([...files, ...chosen]);
      }
    } else {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && onFileChange) {
        onFileChange(selectedFile);
      }
    }
  };

  const handleRemoveFile = (index?: number) => {
    if (multiple) {
      if (onFilesChange && typeof index === 'number') {
        const next = files.slice();
        next.splice(index, 1);
        onFilesChange(next);
      }
    } else {
      onFileChange && onFileChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        accept="image/*"
        onChange={handleFileSelect}
        multiple={multiple}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10'
            : (multiple ? (files.length ? 'border-gray-600 bg-gray-800/50' : 'border-gray-600 hover:border-gray-500') : (file ? 'border-gray-600 bg-gray-800/50' : 'border-gray-600 hover:border-gray-500'))
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {multiple ? (
          <div>
            {files.length ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {files.map((f, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-700">
                        <img src={URL.createObjectURL(f)} alt={`Uploaded ${idx+1}`} className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
                        className="absolute top-1 right-1 p-1 rounded bg-black/60 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">You can drag and drop files or click to upload</p>
              </div>
            )}
          </div>
        ) : file ? (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
              <img
                src={URL.createObjectURL(file)}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
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

      {multiple && (
        <div className="flex mt-6">
          <button
            type="button"
            className="px-3 py-3 text-sm rounded-lg text-white"
            style={{ backgroundColor: '#8A3FFC' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7C3AED'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8A3FFC'; }}
            onClick={handleClick}
          >
            + Add Item
          </button>
        </div>
      )}

      {/* Placeholder URL Display */}
      {(!multiple && !file && placeholder) && (
        <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-600">
          <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 truncate">{placeholder}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
