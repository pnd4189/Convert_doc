/**
 * Step Upload - File upload step for Convert & Split wizard
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
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 1: Tải file lên</h2>
        <p className="text-gray-600">Chọn các file TXT hoặc DOCX để xử lý (tối đa 10 file)</p>
      </div>

      <FileDropzone
        accept=".txt,.doc,.docx"
        multiple
        maxFiles={10}
        onFilesSelected={onFilesChange}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={files.length === 0}
        >
          Tiếp tục →
        </Button>
      </div>
    </div>
  );
}
