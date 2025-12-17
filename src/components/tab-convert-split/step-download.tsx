/**
 * Step Download - Generate and download ZIP file
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ZipFile, createZip } from '@/lib/zip-builder';
import { saveAs } from 'file-saver';

export interface StepDownloadProps {
  files: ZipFile[];
  zipName: string;
  onReset: () => void;
}

export function StepDownload({ files, zipName, onReset }: StepDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>();

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(undefined);

    try {
      const blob = await createZip(files, (percent) => {
        setProgress(percent);
      });
      saveAs(blob, zipName);
      setIsComplete(true);
    } catch (e) {
      setError((e as Error).message || 'Có lỗi khi tạo file ZIP');
    } finally {
      setIsGenerating(false);
    }
  }, [files, zipName]);

  // Auto-start download
  useEffect(() => {
    if (files.length > 0 && !isComplete && !isGenerating) {
      handleDownload();
    }
  }, [files, isComplete, isGenerating, handleDownload]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 5: Tải về</h2>
        <p className="text-gray-600">Đang tạo file ZIP chứa {files.length} file</p>
      </div>

      {isGenerating && (
        <div className="space-y-4">
          <Progress value={progress} label="Đang tạo file ZIP..." />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>❌ {error}</p>
        </div>
      )}

      {isComplete && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg">
          <p>✓ Đã tạo và tải xuống file <strong>{zipName}</strong></p>
          <p className="text-sm mt-1">Chứa {files.length} file</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          ↻ Làm lại từ đầu
        </Button>
        {isComplete && (
          <Button onClick={handleDownload}>
            Tải lại ZIP
          </Button>
        )}
      </div>
    </div>
  );
}
