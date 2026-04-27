/**
 * Step Chapters - Detect, review, filter, and reorder chapters
 * Supports chapter range filtering and custom regex re-detection
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processDocument } from '@/lib/doc-to-epub';
import { filterChaptersByRange, detectWithCustomRegex, PRESET_PATTERNS, parseChapters } from '@/lib/chapter-parser';
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
  const [originalChapters, setOriginalChapters] = useState<DetectedChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startChapter, setStartChapter] = useState(0);
  const [endChapter, setEndChapter] = useState(0);
  const [customRegex, setCustomRegex] = useState('');
  const [regexError, setRegexError] = useState<string | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState('auto');
  const rawTextRef = useRef<string>('');

  const detectChapters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allChapters: DetectedChapter[] = [];
      const allText: string[] = [];
      let index = 1;

      for (const file of files) {
        const processed = await processDocument(file);
        if (processed.text) allText.push(processed.text);
        processed.chapters.forEach((ch) => {
          allChapters.push({ ...ch, index: index++ });
        });
      }

      rawTextRef.current = allText.join('\n');
      setOriginalChapters(allChapters);
      setChapters(allChapters);
      onChaptersDetected(allChapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setIsLoading(false);
    }
  }, [files, onChaptersDetected]);

  useEffect(() => {
    detectChapters();
  }, [detectChapters]);

  const handleApplyRange = () => {
    const filtered = filterChaptersByRange(originalChapters, {
      start: startChapter,
      end: endChapter,
    });
    setChapters(filtered);
  };

  const handleResetRange = () => {
    setStartChapter(0);
    setEndChapter(0);
    setChapters(originalChapters);
  };

  const handleRedetectByPattern = (patternId: string) => {
    setSelectedPatternId(patternId);
    if (patternId === 'auto' || !rawTextRef.current) return;
    const preset = PRESET_PATTERNS.find((p) => p.id === patternId);
    if (!preset) return;
    const detected = parseChapters(rawTextRef.current, preset.pattern);
    const withIndex = detected.map((ch, i) => ({ ...ch, index: i + 1 }));
    setOriginalChapters(withIndex);
    setChapters(withIndex);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newChapters = [...chapters];
    [newChapters[index - 1], newChapters[index]] = [
      newChapters[index],
      newChapters[index - 1],
    ];
    setChapters(newChapters.map((ch, i) => ({ ...ch, index: i + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const newChapters = [...chapters];
    [newChapters[index], newChapters[index + 1]] = [
      newChapters[index + 1],
      newChapters[index],
    ];
    setChapters(newChapters.map((ch, i) => ({ ...ch, index: i + 1 })));
  };

  const handleRemove = (index: number) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters.map((ch, i) => ({ ...ch, index: i + 1 })));
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

      {/* Pattern re-detect */}
      <div className="flex flex-wrap gap-3 items-end p-3 bg-blue-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pattern phát hiện chương</label>
          <select
            value={selectedPatternId}
            onChange={(e) => handleRedetectByPattern(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="auto">Tự động (Auto)</option>
            {PRESET_PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.description}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chapter range filter */}
      <div className="flex flex-wrap gap-3 items-end p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Từ chương</label>
          <Input
            type="number"
            min={0}
            value={startChapter}
            onChange={(e) => setStartChapter(parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Đến chương</label>
          <Input
            type="number"
            min={0}
            value={endChapter}
            onChange={(e) => setEndChapter(parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <Button size="sm" onClick={handleApplyRange}>Áp dụng</Button>
        <Button size="sm" variant="outline" onClick={handleResetRange}>Đặt lại</Button>
        <span className="text-xs text-gray-500 self-center">Để 0 để chọn tất cả</span>
      </div>

      {/* Custom regex (collapsible advanced) */}
      <details className="group">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
          Cài đặt nâng cao (Regex tùy chỉnh)
        </summary>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Input
              value={customRegex}
              onChange={(e) => {
                setCustomRegex(e.target.value);
                setRegexError(null);
              }}
              placeholder='Ví dụ: ^第[一二三四五六七八九十百千万0-9]+[章回]'
              className="font-mono text-sm flex-1"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!customRegex.trim()) return;
                try {
                  const raw = rawTextRef.current;
                  if (!raw) { setRegexError('Chưa có nội dung'); return; }
                  const detected = detectWithCustomRegex(raw, customRegex);
                  setOriginalChapters(detected);
                  setChapters(detected);
                  setRegexError(null);
                } catch {
                  setRegexError('Regex không hợp lệ');
                }
              }}
            >
              Phát hiện lại
            </Button>
          </div>
          {regexError && (
            <p className="text-xs text-red-600">{regexError}</p>
          )}
        </div>
      </details>

      {/* Chapter list */}
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
