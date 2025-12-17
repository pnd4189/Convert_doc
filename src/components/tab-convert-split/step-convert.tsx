/**
 * Step Convert - Optional file conversion step
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileInfo, processFiles, formatFileSize } from '@/lib/file-processor';
import { textToDocx, getFileType } from '@/lib/docx-converter';
import { saveAs } from 'file-saver';

export interface StepConvertProps {
  files: File[];
  onConvert: (convertedFiles: FileInfo[]) => void;
  onSkip: (fileInfos: FileInfo[]) => void;
  onBack: () => void;
}

type ConvertDirection = 'txt-to-docx' | 'docx-to-txt' | 'none';

export function StepConvert({ files, onConvert, onSkip, onBack }: StepConvertProps) {
  const [direction, setDirection] = useState<ConvertDirection>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSkip = useCallback(async () => {
    setIsProcessing(true);
    const processed = await processFiles(files, (current, total) => {
      setProgress(Math.round((current / total) * 100));
    });
    setIsProcessing(false);
    onSkip(processed);
  }, [files, onSkip]);

  const handleConvert = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);

    // First process all files to read content
    const processed = await processFiles(files, (current, total) => {
      setProgress(Math.round((current / total) * 50));
    });

    if (direction === 'txt-to-docx') {
      // Convert TXT files to DOCX and download
      for (let i = 0; i < processed.length; i++) {
        const file = processed[i];
        if (file.type === 'txt' && file.content) {
          const docxBlob = await textToDocx(file.content, file.name);
          const newName = file.name.replace(/\.txt$/i, '.docx');
          saveAs(docxBlob, newName);
        }
        setProgress(50 + Math.round(((i + 1) / processed.length) * 50));
      }
    }

    setIsProcessing(false);
    onConvert(processed);
  }, [files, direction, onConvert]);

  const txtCount = files.filter(f => getFileType(f.name) === 'txt').length;
  const docxCount = files.filter(f => getFileType(f.name) === 'docx' || getFileType(f.name) === 'doc').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 2: Chuyển đổi định dạng</h2>
        <p className="text-gray-600">Bạn có thể chuyển đổi định dạng file hoặc bỏ qua bước này</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-3">Thống kê file:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• File TXT: {txtCount}</li>
          <li>• File DOCX/DOC: {docxCount}</li>
          <li>• Tổng dung lượng: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}</li>
        </ul>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="convert"
            value="none"
            checked={direction === 'none'}
            onChange={() => setDirection('none')}
            className="h-4 w-4 text-blue-600"
          />
          <span>Không chuyển đổi (giữ nguyên định dạng)</span>
        </label>

        {txtCount > 0 && (
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="convert"
              value="txt-to-docx"
              checked={direction === 'txt-to-docx'}
              onChange={() => setDirection('txt-to-docx')}
              className="h-4 w-4 text-blue-600"
            />
            <span>Chuyển TXT → DOCX (tải xuống file DOCX)</span>
          </label>
        )}
      </div>

      {isProcessing && (
        <Progress value={progress} label="Đang xử lý..." />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          ← Quay lại
        </Button>
        <div className="space-x-3">
          <Button variant="secondary" onClick={handleSkip} disabled={isProcessing} loading={isProcessing && direction === 'none'}>
            Bỏ qua
          </Button>
          {direction !== 'none' && (
            <Button onClick={handleConvert} disabled={isProcessing} loading={isProcessing}>
              Chuyển đổi & tiếp tục
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
