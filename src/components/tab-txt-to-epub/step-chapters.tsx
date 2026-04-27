/**
 * TXT to EPUB - Step Chapters: Pattern selection, chapter range, custom regex
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processTxt } from '@/lib/doc-to-epub';
import {
  PRESET_PATTERNS,
  parseChapters,
  filterChaptersByRange,
  detectWithCustomRegex,
  autoDetectPattern,
} from '@/lib/chapter-parser';
import type { DetectedChapter } from '@/lib/epub';

interface StepChaptersProps {
  files: File[];
  encoding: string;
  onConfirm: (chapters: DetectedChapter[]) => void;
  onBack: () => void;
}

export function StepChapters({ files, encoding, onConfirm, onBack }: StepChaptersProps) {
  const [chapters, setChapters] = useState<DetectedChapter[]>([]);
  const [originalChapters, setOriginalChapters] = useState<DetectedChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState('auto');
  const [startChapter, setStartChapter] = useState(0);
  const [endChapter, setEndChapter] = useState(0);
  const [customRegex, setCustomRegex] = useState('');
  const [regexError, setRegexError] = useState<string | null>(null);
  const rawTextRef = useRef('');

  const loadAndDetect = useCallback(async (patternId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const allText: string[] = [];
      for (const file of files) {
        const result = await processTxt(file, { encoding });
        allText.push(result.text);
      }
      const combined = allText.join('\n');
      rawTextRef.current = combined;

      let detected: DetectedChapter[];
      if (patternId === 'auto') {
        const autoResult = autoDetectPattern(combined);
        const preset = PRESET_PATTERNS.find((p) => p.id === autoResult.patternId);
        if (preset && autoResult.matchCount > 0) {
          detected = parseChapters(combined, preset.pattern);
          setSelectedPatternId(autoResult.patternId);
        } else {
          detected = [];
        }
      } else {
        const preset = PRESET_PATTERNS.find((p) => p.id === patternId);
        detected = preset ? parseChapters(combined, preset.pattern) : [];
      }

      const indexed = detected.map((ch, i) => ({ ...ch, index: i + 1 }));
      setOriginalChapters(indexed);
      setChapters(indexed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi đọc file');
    } finally {
      setIsLoading(false);
    }
  }, [files, encoding]);

  useEffect(() => {
    loadAndDetect('auto');
  }, [loadAndDetect]);

  const handlePatternChange = async (patternId: string) => {
    setSelectedPatternId(patternId);
    if (!rawTextRef.current) return;

    if (patternId === 'auto') {
      await loadAndDetect('auto');
      return;
    }
    const preset = PRESET_PATTERNS.find((p) => p.id === patternId);
    if (!preset) return;
    const detected = parseChapters(rawTextRef.current, preset.pattern);
    const indexed = detected.map((ch, i) => ({ ...ch, index: i + 1 }));
    setOriginalChapters(indexed);
    setChapters(indexed);
  };

  const handleApplyRange = () => {
    const filtered = filterChaptersByRange(originalChapters, { start: startChapter, end: endChapter });
    setChapters(filtered);
  };

  const handleResetRange = () => {
    setStartChapter(0);
    setEndChapter(0);
    setChapters(originalChapters);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...chapters];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setChapters(arr.map((ch, i) => ({ ...ch, index: i + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const arr = [...chapters];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setChapters(arr.map((ch, i) => ({ ...ch, index: i + 1 })));
  };

  const handleRemove = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index).map((ch, i) => ({ ...ch, index: i + 1 })));
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600">Đang đọc và phân tích file...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Lỗi: {error}</p>
        <Button variant="outline" onClick={onBack}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 3: Cấu hình chương</h2>
        <p className="text-gray-600">Đã phát hiện {chapters.length} chương. Chọn pattern và điều chỉnh.</p>
      </div>

      {/* Pattern selector */}
      <div className="p-3 bg-blue-50 rounded-lg space-y-2">
        <label className="block text-sm font-medium text-gray-700">Pattern phát hiện chương</label>
        <select
          value={selectedPatternId}
          onChange={(e) => handlePatternChange(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="auto">Tự động (Auto-detect)</option>
          {PRESET_PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.description}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          {chapters.length > 0
            ? `✓ Tìm thấy ${chapters.length} chương với pattern hiện tại`
            : '⚠ Không tìm thấy chương. Hãy thử pattern khác hoặc dùng regex tùy chỉnh.'}
        </p>
      </div>

      {/* Chapter range */}
      <div className="flex flex-wrap gap-3 items-end p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Từ chương</label>
          <Input
            type="number" min={0} value={startChapter}
            onChange={(e) => setStartChapter(parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Đến chương</label>
          <Input
            type="number" min={0} value={endChapter}
            onChange={(e) => setEndChapter(parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <Button size="sm" onClick={handleApplyRange}>Áp dụng</Button>
        <Button size="sm" variant="outline" onClick={handleResetRange}>Đặt lại</Button>
        <span className="text-xs text-gray-500 self-center">Để 0 để chọn tất cả</span>
      </div>

      {/* Custom regex (advanced) */}
      <details>
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
          Regex tùy chỉnh (nâng cao)
        </summary>
        <div className="mt-2 flex gap-2">
          <Input
            value={customRegex}
            onChange={(e) => { setCustomRegex(e.target.value); setRegexError(null); }}
            placeholder="^第[一二三四五六七八九十百千万0-9]+[章回]"
            className="font-mono text-sm flex-1"
          />
          <Button size="sm" onClick={() => {
            if (!customRegex.trim()) return;
            try {
              const detected = detectWithCustomRegex(rawTextRef.current, customRegex);
              const indexed = detected.map((ch, i) => ({ ...ch, index: i + 1 }));
              setOriginalChapters(indexed);
              setChapters(indexed);
              setRegexError(null);
            } catch {
              setRegexError('Regex không hợp lệ');
            }
          }}>Phát hiện</Button>
        </div>
        {regexError && <p className="text-xs text-red-600 mt-1">{regexError}</p>}
      </details>

      {/* Chapter list */}
      <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
        {chapters.map((ch, index) => (
          <div key={ch.index} className="flex items-center justify-between p-3">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
              <span className="font-medium">{ch.title}</span>
              <span className="text-xs text-gray-400 ml-2">({ch.content.length} ký tự)</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 text-gray-500 disabled:opacity-30">↑</button>
              <button onClick={() => handleMoveDown(index)} disabled={index === chapters.length - 1} className="p-1 text-gray-500 disabled:opacity-30">↓</button>
              <button onClick={() => handleRemove(index)} className="p-1 text-red-500">×</button>
            </div>
          </div>
        ))}
        {chapters.length === 0 && (
          <div className="p-6 text-center text-gray-500">Không có chương nào</div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Quay lại</Button>
        <Button onClick={() => onConfirm(chapters)} disabled={chapters.length === 0}>
          Tiếp tục ({chapters.length} chương)
        </Button>
      </div>
    </div>
  );
}
