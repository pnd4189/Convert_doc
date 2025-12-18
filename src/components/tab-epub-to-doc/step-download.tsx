/**
 * Step Download - Download converted files
 */

'use client';

import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import type { ConvertResult } from '@/lib/epub-reader';

export interface StepDownloadProps {
  results: ConvertResult[];
  onReset: () => void;
}

export function StepDownload({ results, onReset }: StepDownloadProps) {
  const handleDownloadSingle = (result: ConvertResult) => {
    saveAs(result.blob, result.filename);
  };

  const handleDownloadAll = async () => {
    if (results.length === 1) {
      handleDownloadSingle(results[0]);
      return;
    }

    const zip = new JSZip();
    results.forEach((r) => zip.file(r.filename, r.blob));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'converted_files.zip');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 4: Tải file về</h2>
        <p className="text-gray-600">Đã chuyển đổi xong {results.length} file</p>
      </div>

      {results.length > 0 ? (
        <div className="space-y-2 border rounded-lg divide-y">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3">
              <span className="text-gray-900">{result.filename}</span>
              <Button variant="outline" size="sm" onClick={() => handleDownloadSingle(result)}>
                Tải xuống
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Không có file nào được chuyển đổi</div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          Làm lại
        </Button>
        {results.length > 0 && (
          <Button onClick={handleDownloadAll}>
            {results.length === 1 ? 'Tải file' : 'Tải tất cả (ZIP)'}
          </Button>
        )}
      </div>
    </div>
  );
}
