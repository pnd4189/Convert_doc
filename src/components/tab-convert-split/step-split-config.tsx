/**
 * Step Split Config - Configure how to split chapters into files
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chapter } from '@/lib/chapter-parser';
import { ZipFile } from '@/lib/zip-builder';
import { splitByChapters, calculateSplitCount } from '@/lib/file-processor';

export interface StepSplitConfigProps {
  chapters: Chapter[];
  baseName: string;
  content: string;
  onConfigured: (files: ZipFile[]) => void;
  onBack: () => void;
}

export function StepSplitConfig({ chapters, baseName, content, onConfigured, onBack }: StepSplitConfigProps) {
  const [chaptersPerFile, setChaptersPerFile] = useState(10);

  const fileCount = useMemo(() => {
    return calculateSplitCount(chapters.length, chaptersPerFile);
  }, [chapters.length, chaptersPerFile]);

  const previewNames = useMemo(() => {
    if (chaptersPerFile <= 0) return [];
    const names: string[] = [];
    for (let i = 0; i < Math.min(fileCount, 3); i++) {
      const startIdx = i * chaptersPerFile;
      const endIdx = Math.min((i + 1) * chaptersPerFile, chapters.length);
      const startChapter = chapters[startIdx]?.index || 1;
      const endChapter = chapters[endIdx - 1]?.index || startChapter;
      names.push(`${baseName}_chuong_${startChapter.toString().padStart(3, '0')}-${endChapter.toString().padStart(3, '0')}.txt`);
    }
    if (fileCount > 3) {
      names.push('...');
    }
    return names;
  }, [chapters, chaptersPerFile, baseName, fileCount]);

  const handleContinue = useCallback(() => {
    if (chaptersPerFile > 0 && chapters.length > 0) {
      const files = splitByChapters(content, chapters, chaptersPerFile, baseName);
      onConfigured(files);
    }
  }, [chaptersPerFile, chapters, content, baseName, onConfigured]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 4: Cấu hình tách file</h2>
        <p className="text-gray-600">Chọn số chương muốn gộp vào mỗi file</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700">Tổng số chương: <strong>{chapters.length}</strong></p>
      </div>

      <div className="max-w-xs">
        <Input
          type="number"
          label="Số chương mỗi file"
          value={chaptersPerFile}
          onChange={(e) => setChaptersPerFile(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={chapters.length}
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800">
          Sẽ tạo ra <strong>{fileCount}</strong> file
        </p>
      </div>

      {previewNames.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Xem trước tên file:</h3>
          <ul className="space-y-1 text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded-lg">
            {previewNames.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button onClick={handleContinue} disabled={chaptersPerFile <= 0 || fileCount === 0}>
          Tách file →
        </Button>
      </div>
    </div>
  );
}
