/**
 * FileDropzone Component - Drag & drop file upload area
 */

'use client';

import { useCallback, useState, DragEvent, ChangeEvent } from 'react';
import { formatFileSize } from '@/lib/file-processor';

export interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  files?: File[];
  onRemoveFile?: (index: number) => void;
}

export function FileDropzone({
  accept = '.txt,.doc,.docx',
  multiple = true,
  maxFiles = 10,
  onFilesSelected,
  disabled = false,
  files = [],
  onRemoveFile,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.slice(0, maxFiles);
    onFilesSelected(validFiles);
  }, [disabled, maxFiles, onFilesSelected]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, maxFiles);
      onFilesSelected(selectedFiles);
    }
  }, [maxFiles, onFilesSelected]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-gray-600">
            <span className="font-medium text-blue-600">Nhấp để chọn file</span> hoặc kéo thả vào đây
          </div>
          <p className="text-xs text-gray-500">
            {accept.split(',').join(', ')} (tối đa {maxFiles} file)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Đã chọn {files.length} file:</h4>
          <ul className="divide-y divide-gray-200 border rounded-lg">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
