/**
 * Step Detect Chapters - Chapter detection and preview
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Chapter,
  PRESET_PATTERNS,
  parseChapters,
  validatePattern,
  getPreviewChapters,
  createPattern
} from '@/lib/chapter-parser';

export interface StepDetectChaptersProps {
  content: string;
  onChaptersDetected: (chapters: Chapter[]) => void;
  onBack: () => void;
}

export function StepDetectChapters({ content, onChaptersDetected, onBack }: StepDetectChaptersProps) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PATTERNS[0].id);
  const [useCustom, setUseCustom] = useState(false);
  const [customPattern, setCustomPattern] = useState('');
  const [patternError, setPatternError] = useState<string>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hasDetected, setHasDetected] = useState(false);

  const presetOptions = PRESET_PATTERNS.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const handleDetect = useCallback(() => {
    let pattern: RegExp;

    if (useCustom) {
      const validation = validatePattern(customPattern);
      if (!validation.valid) {
        setPatternError(validation.error);
        return;
      }
      pattern = createPattern(customPattern);
    } else {
      const preset = PRESET_PATTERNS.find(p => p.id === selectedPreset);
      if (!preset) return;
      pattern = preset.pattern;
    }

    setPatternError(undefined);
    const detected = parseChapters(content, pattern);
    setChapters(detected);
    setHasDetected(true);
  }, [content, useCustom, customPattern, selectedPreset]);

  const handleContinue = useCallback(() => {
    if (chapters.length > 0) {
      onChaptersDetected(chapters);
    }
  }, [chapters, onChaptersDetected]);

  const previewChapters = getPreviewChapters(chapters, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 3: Nhận diện chương</h2>
        <p className="text-gray-600">Chọn pattern để nhận diện các chương trong file</p>
      </div>

      <div className="space-y-4">
        <Select
          label="Chọn pattern có sẵn"
          options={presetOptions}
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          disabled={useCustom}
        />

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={useCustom}
            onChange={(e) => setUseCustom(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">Sử dụng regex tùy chỉnh</span>
        </label>

        {useCustom && (
          <Input
            label="Regex pattern"
            placeholder="^Chương\s+\d+"
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            error={patternError}
          />
        )}

        <Button onClick={handleDetect}>
          Kiểm tra pattern
        </Button>
      </div>

      {hasDetected && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${chapters.length > 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            {chapters.length > 0 ? (
              <p>✓ Tìm thấy <strong>{chapters.length}</strong> chương</p>
            ) : (
              <p>⚠ Không tìm thấy chương nào. Hãy thử pattern khác.</p>
            )}
          </div>

          {previewChapters.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Xem trước {previewChapters.length} chương đầu:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dòng</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewChapters.map((chapter) => (
                      <tr key={chapter.index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{chapter.index}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">{chapter.title}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{chapter.startLine} - {chapter.endLine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button onClick={handleContinue} disabled={chapters.length === 0}>
          Tiếp tục →
        </Button>
      </div>
    </div>
  );
}
