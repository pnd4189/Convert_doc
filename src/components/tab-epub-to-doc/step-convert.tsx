/**
 * Step Convert - Process EPUB files with progress display
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { batchConvertEpub, type ConvertResult } from '@/lib/epub-reader';
import type { OutputFormat } from './index';

export interface StepConvertProps {
  files: File[];
  format: OutputFormat;
  onComplete: (results: ConvertResult[]) => void;
  onBack: () => void;
}

export function StepConvert({ files, format, onComplete, onBack }: StepConvertProps) {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Prevent double execution in strict mode
    if (hasStarted.current) return;
    hasStarted.current = true;

    const convert = async () => {
      setIsConverting(true);
      setError(null);

      try {
        const results = await batchConvertEpub(files, format, (progressInfo) => {
          setCurrentFile(progressInfo.filename);
          setProgress(Math.round((progressInfo.current / progressInfo.total) * 100));
        });

        setProgress(100);
        onComplete(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi trong quá trình chuyển đổi');
        setIsConverting(false);
      }
    };

    convert();
  }, [files, format, onComplete]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 3: Đang chuyển đổi</h2>
        <p className="text-gray-600">Vui lòng đợi trong khi file đang được xử lý</p>
      </div>

      <div className="space-y-4">
        <Progress value={progress} />

        <div className="text-center">
          {isConverting && (
            <p className="text-gray-600">
              Đang xử lý: {currentFile} ({progress}%)
            </p>
          )}
          {error && <p className="text-red-600">Lỗi: {error}</p>}
        </div>
      </div>

      {error && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            Quay lại
          </Button>
        </div>
      )}
    </div>
  );
}
