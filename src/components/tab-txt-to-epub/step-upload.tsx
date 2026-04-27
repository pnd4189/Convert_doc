/**
 * TXT to EPUB - Step Upload: Accept TXT files only
 */

'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface StepUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onNext: () => void;
}

export function StepUpload({ files, onFilesChange, onNext }: StepUploadProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    onFilesChange(selected);
  }, [onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith('.txt')
    );
    if (dropped.length > 0) onFilesChange(dropped);
  }, [onFilesChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 1: Tải file TXT</h2>
        <p className="text-gray-600">Chọn file .txt để chuyển đổi sang EPUB với các tùy chọn nâng cao</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
      >
        <p className="text-gray-500 mb-4">Kéo thả file TXT vào đây hoặc</p>
        <label className="cursor-pointer">
          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Chọn file TXT
          </span>
          <input
            type="file"
            accept=".txt"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="border rounded-lg divide-y">
          {files.map((f) => (
            <div key={f.name} className="flex items-center justify-between p-3">
              <span className="text-sm font-medium">{f.name}</span>
              <span className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={files.length === 0}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
