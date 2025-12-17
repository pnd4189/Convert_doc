/**
 * Step Upload - File upload for Merge & EPUB wizard
 */

'use client';

import { useState, useCallback } from 'react';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileInfo, processFiles } from '@/lib/file-processor';

export interface StepUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onNext: (processed: FileInfo[]) => void;
}

export function StepUpload({ files, onFilesChange, onNext }: StepUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleNext = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);

    const processed = await processFiles(files, (current, total) => {
      setProgress(Math.round((current / total) * 100));
    });

    setIsProcessing(false);
    onNext(processed);
  }, [files, onNext]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 1: Tải file lên</h2>
        <p className="text-gray-600">Chọn các file muốn gộp lại (TXT, DOC, DOCX)</p>
      </div>

      <FileDropzone
        accept=".txt,.doc,.docx"
        multiple
        maxFiles={50}
        onFilesSelected={onFilesChange}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      {isProcessing && (
        <Progress value={progress} label="Đang đọc file..." />
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={files.length === 0 || isProcessing}
          loading={isProcessing}
        >
          Tiếp tục →
        </Button>
      </div>
    </div>
  );
}
