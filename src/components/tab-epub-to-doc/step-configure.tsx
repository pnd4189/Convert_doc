/**
 * Step Configure - Select output format (DOCX or TXT)
 */

'use client';

import { Button } from '@/components/ui/button';
import type { OutputFormat } from './index';

export interface StepConfigureProps {
  format: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepConfigure({ format, onFormatChange, onNext, onBack }: StepConfigureProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 2: Chọn định dạng xuất</h2>
        <p className="text-gray-600">Chọn định dạng file đầu ra</p>
      </div>

      <div className="space-y-4">
        <label
          className={`
          flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
          ${format === 'docx' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        `}
        >
          <input
            type="radio"
            name="format"
            value="docx"
            checked={format === 'docx'}
            onChange={() => onFormatChange('docx')}
            className="h-4 w-4 text-blue-600"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">DOCX (Word)</span>
            <p className="text-sm text-gray-500">
              Giữ nguyên định dạng heading, bold, italic, lists, tables
            </p>
          </div>
        </label>

        <label
          className={`
          flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
          ${format === 'txt' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        `}
        >
          <input
            type="radio"
            name="format"
            value="txt"
            checked={format === 'txt'}
            onChange={() => onFormatChange('txt')}
            className="h-4 w-4 text-blue-600"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">TXT (Markdown)</span>
            <p className="text-sm text-gray-500">
              Text thuần với cấu trúc Markdown (# heading, **bold**, *italic*)
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={onNext}>Tiếp tục</Button>
      </div>
    </div>
  );
}
