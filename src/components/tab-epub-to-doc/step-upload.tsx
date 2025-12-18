/**
 * Step Upload - Upload EPUB files for conversion
 */

'use client';

import { FileDropzone } from '@/components/ui/file-dropzone';
import { Button } from '@/components/ui/button';

export interface StepUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onNext: () => void;
}

export function StepUpload({ files, onFilesChange, onNext }: StepUploadProps) {
  const handleRemoveFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 1: Tải file EPUB</h2>
        <p className="text-gray-600">Chọn các file EPUB để chuyển đổi (tối đa 10 file)</p>
      </div>

      <FileDropzone
        accept=".epub"
        multiple
        maxFiles={10}
        onFilesSelected={onFilesChange}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={files.length === 0}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
