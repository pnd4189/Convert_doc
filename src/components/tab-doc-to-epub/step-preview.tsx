/**
 * Step Preview - Preview final EPUB structure before export
 */

'use client';

import { Button } from '@/components/ui/button';
import type { EpubMetadata, DetectedChapter } from '@/lib/epub';

export interface StepPreviewProps {
  metadata: EpubMetadata;
  chapters: DetectedChapter[];
  onNext: () => void;
  onBack: () => void;
}

export function StepPreview({
  metadata,
  chapters,
  onNext,
  onBack,
}: StepPreviewProps) {
  const totalChars = chapters.reduce((sum, ch) => sum + ch.content.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 4: Xem trước
        </h2>
        <p className="text-gray-600">
          Kiểm tra thông tin trước khi xuất file EPUB
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Tên sách:</span>
            <p className="font-medium">{metadata.title}</p>
          </div>
          <div>
            <span className="text-gray-500">Tác giả:</span>
            <p className="font-medium">{metadata.author || '(Không có)'}</p>
          </div>
          <div>
            <span className="text-gray-500">Số chương:</span>
            <p className="font-medium">{chapters.length}</p>
          </div>
          <div>
            <span className="text-gray-500">Tổng ký tự:</span>
            <p className="font-medium">{totalChars.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <span className="text-gray-500 text-sm">Mục lục:</span>
          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {chapters.map((ch, i) => (
              <li key={i} className="text-sm">
                <span className="text-gray-400">{i + 1}.</span> {ch.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={onNext}>Xuất EPUB</Button>
      </div>
    </div>
  );
}
