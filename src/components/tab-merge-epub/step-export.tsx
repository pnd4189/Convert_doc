/**
 * Step Export - Export merged content as TXT or EPUB
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { generateEpub } from '@/lib/epub';
import { saveAs } from 'file-saver';

export interface StepExportProps {
  content: string;
  defaultName: string;
  onReset: () => void;
}

export function StepExport({ content, defaultName, onReset }: StepExportProps) {
  const [fileName, setFileName] = useState(defaultName);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedFormat, setExportedFormat] = useState<'txt' | 'epub' | null>(null);
  const [error, setError] = useState<string>();

  const handleExportTxt = useCallback(() => {
    setIsExporting(true);
    setProgress(50);
    setError(undefined);

    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
      setProgress(100);
      setExportedFormat('txt');
    } catch (e) {
      setError((e as Error).message || 'Có lỗi khi tạo file TXT');
    } finally {
      setIsExporting(false);
    }
  }, [content, fileName]);

  const handleExportEpub = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);
    setError(undefined);

    try {
      setProgress(30);
      const blob = await generateEpub({
        title: fileName,
        content: content,
      });
      setProgress(90);
      saveAs(blob, `${fileName}.epub`);
      setProgress(100);
      setExportedFormat('epub');
    } catch (e) {
      setError((e as Error).message || 'Có lỗi khi tạo file EPUB');
    } finally {
      setIsExporting(false);
    }
  }, [content, fileName]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 4: Xuất file</h2>
        <p className="text-gray-600">Chọn định dạng file muốn tải về</p>
      </div>

      <div className="max-w-md">
        <Input
          label="Tên file (không cần đuôi)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="ten-file"
        />
      </div>

      {isExporting && (
        <Progress value={progress} label="Đang tạo file..." />
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>❌ {error}</p>
        </div>
      )}

      {exportedFormat && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg">
          <p>✓ Đã tải xuống <strong>{fileName}.{exportedFormat}</strong></p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleExportTxt}
          disabled={isExporting || !fileName}
          className="
            flex flex-col items-center justify-center p-6 border-2 rounded-lg
            hover:border-blue-500 hover:bg-blue-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-gray-700">Tải file TXT</span>
          <span className="text-sm text-gray-500">Plain text</span>
        </button>

        <button
          onClick={handleExportEpub}
          disabled={isExporting || !fileName}
          className="
            flex flex-col items-center justify-center p-6 border-2 rounded-lg
            hover:border-blue-500 hover:bg-blue-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-medium text-gray-700">Chuyển sang EPUB</span>
          <span className="text-sm text-gray-500">E-book format</span>
        </button>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onReset}>
          ↻ Làm lại từ đầu
        </Button>
      </div>
    </div>
  );
}
