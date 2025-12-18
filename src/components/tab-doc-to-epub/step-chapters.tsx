/**
 * Step Chapters - Detect, review, and reorder chapters
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { processDocument } from '@/lib/doc-to-epub';
import type { DetectedChapter } from '@/lib/epub';

export interface StepChaptersProps {
  files: File[];
  onChaptersDetected: (chapters: DetectedChapter[]) => void;
  onConfirm: (chapters: DetectedChapter[]) => void;
  onBack: () => void;
}

export function StepChapters({
  files,
  onChaptersDetected,
  onConfirm,
  onBack,
}: StepChaptersProps) {
  const [chapters, setChapters] = useState<DetectedChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detect = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allChapters: DetectedChapter[] = [];
        let index = 1;

        for (const file of files) {
          const processed = await processDocument(file);
          processed.chapters.forEach((ch) => {
            allChapters.push({ ...ch, index: index++ });
          });
        }

        setChapters(allChapters);
        onChaptersDetected(allChapters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Detection failed');
      } finally {
        setIsLoading(false);
      }
    };

    detect();
  }, [files, onChaptersDetected]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newChapters = [...chapters];
    [newChapters[index - 1], newChapters[index]] = [
      newChapters[index],
      newChapters[index - 1],
    ];
    // Re-index
    newChapters.forEach((ch, i) => {
      ch.index = i + 1;
    });
    setChapters(newChapters);
  };

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const newChapters = [...chapters];
    [newChapters[index], newChapters[index + 1]] = [
      newChapters[index + 1],
      newChapters[index],
    ];
    newChapters.forEach((ch, i) => {
      ch.index = i + 1;
    });
    setChapters(newChapters);
  };

  const handleRemove = (index: number) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    newChapters.forEach((ch, i) => {
      ch.index = i + 1;
    });
    setChapters(newChapters);
  };

  const handleConfirm = () => {
    onConfirm(chapters);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Đang phân tích nội dung...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Lỗi: {error}</p>
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 3: Xem xét chương
        </h2>
        <p className="text-gray-600">
          Đã phát hiện {chapters.length} chương. Bạn có thể sắp xếp lại hoặc
          xóa.
        </p>
      </div>

      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.index}
            className="flex items-center justify-between p-3"
          >
            <div className="flex-1">
              <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
              <span className="font-medium">{chapter.title}</span>
              <span className="text-xs text-gray-400 ml-2">
                ({chapter.content.length} ký tự)
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === chapters.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={handleConfirm} disabled={chapters.length === 0}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
