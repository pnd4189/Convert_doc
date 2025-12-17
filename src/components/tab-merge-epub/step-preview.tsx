/**
 * Step Preview - Preview merged content
 */

'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

export interface StepPreviewProps {
  content: string;
  onNext: () => void;
  onBack: () => void;
}

export function StepPreview({ content, onNext, onBack }: StepPreviewProps) {
  const stats = useMemo(() => {
    const charCount = content.length;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const lineCount = content.split('\n').length;
    return { charCount, wordCount, lineCount };
  }, [content]);

  const previewContent = useMemo(() => {
    const maxLength = 2000;
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '\n\n... (còn nữa)';
  }, [content]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 3: Xem trước</h2>
        <p className="text-gray-600">Kiểm tra nội dung đã gộp</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.charCount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Ký tự</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.wordCount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Từ</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.lineCount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Dòng</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-700 mb-2">Xem trước nội dung:</h3>
        <div className="border rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
            {previewContent}
          </pre>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button onClick={onNext}>
          Tiếp tục →
        </Button>
      </div>
    </div>
  );
}
