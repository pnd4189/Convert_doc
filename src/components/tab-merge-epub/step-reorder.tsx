/**
 * Step Reorder - Reorder files by drag & drop or buttons
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileInfo, formatFileSize } from '@/lib/file-processor';

export interface StepReorderProps {
  files: FileInfo[];
  onReorder: (files: FileInfo[]) => void;
  onBack: () => void;
}

export function StepReorder({ files: initialFiles, onReorder, onBack }: StepReorderProps) {
  const [files, setFiles] = useState<FileInfo[]>(initialFiles);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [removed] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, removed);
    setFiles(newFiles);
  }, [files]);

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveFile(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < files.length - 1) {
      moveFile(index, index + 1);
    }
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveFile(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleContinue = () => {
    onReorder(files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 2: Sắp xếp thứ tự</h2>
        <p className="text-gray-600">Kéo thả hoặc dùng nút để sắp xếp thứ tự file</p>
      </div>

      <div className="border rounded-lg divide-y">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center justify-between p-3 bg-white
              ${draggedIndex === index ? 'opacity-50 bg-blue-50' : ''}
              hover:bg-gray-50 cursor-move
            `}
          >
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 cursor-grab">≡</span>
              <span className="font-medium text-gray-700">{index + 1}.</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Di chuyển lên"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === files.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Di chuyển xuống"
              >
                ↓
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="p-1 text-red-400 hover:text-red-600"
                title="Xóa"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không có file nào
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button onClick={handleContinue} disabled={files.length === 0}>
          Tiếp tục →
        </Button>
      </div>
    </div>
  );
}
