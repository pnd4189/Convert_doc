/**
 * TXT to EPUB - Step Setup: Metadata, encoding, font, cover options
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EpubMetadata } from '@/lib/epub';

export interface TxtToEpubSetup {
  metadata: EpubMetadata;
  encoding: string;
  coverImage: File | null;
  fontFile: File | null;
  useDefaultCjkFont: boolean;
}

interface StepSetupProps {
  files: File[];
  initial: TxtToEpubSetup;
  onComplete: (setup: TxtToEpubSetup) => void;
  onBack: () => void;
}

const ENCODINGS = [
  { value: 'auto', label: 'Tự động (Auto-detect)' },
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'gbk', label: 'GBK (Tiếng Trung giản thể)' },
  { value: 'gb2312', label: 'GB2312 (Tiếng Trung cũ)' },
  { value: 'big5', label: 'Big5 (Tiếng Trung phồn thể)' },
  { value: 'shift-jis', label: 'Shift-JIS (Tiếng Nhật)' },
  { value: 'windows-1258', label: 'Windows-1258 (Tiếng Việt legacy)' },
];

export function StepSetup({ files, initial, onComplete, onBack }: StepSetupProps) {
  const [title, setTitle] = useState(initial.metadata.title);
  const [author, setAuthor] = useState(initial.metadata.author || '');
  const [translator, setTranslator] = useState(initial.metadata.translator || '');
  const [language, setLanguage] = useState(initial.metadata.language || 'vi');
  const [encoding, setEncoding] = useState(initial.encoding);
  const [coverImage, setCoverImage] = useState<File | null>(initial.coverImage);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [fontFile, setFontFile] = useState<File | null>(initial.fontFile);
  const [useDefaultCjkFont, setUseDefaultCjkFont] = useState(initial.useDefaultCjkFont);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File font quá lớn (>20MB).');
      return;
    }
    setFontFile(file);
    setUseDefaultCjkFont(false);
  };

  const handleSubmit = () => {
    onComplete({
      metadata: {
        title: title.trim() || 'Untitled',
        author: author.trim() || undefined,
        translator: translator.trim() || undefined,
        language,
      },
      encoding,
      coverImage,
      fontFile: useDefaultCjkFont ? null : fontFile,
      useDefaultCjkFont,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 2: Cài đặt</h2>
        <p className="text-gray-600">Nhập thông tin sách và các tùy chọn chuyển đổi</p>
      </div>

      <div className="space-y-4 max-w-md">
        {/* Metadata */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên sách" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nhập tên tác giả" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dịch giả</label>
          <Input value={translator} onChange={(e) => setTranslator(e.target.value)} placeholder="Nhập tên dịch giả (nếu có)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="vi">Tiếng Việt (vi)</option>
            <option value="zh">Tiếng Trung (zh)</option>
            <option value="en">Tiếng Anh (en)</option>
            <option value="ja">Tiếng Nhật (ja)</option>
            <option value="ko">Tiếng Hàn (ko)</option>
          </select>
        </div>

        {/* Encoding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Encoding file TXT</label>
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {ENCODINGS.map((enc) => (
              <option key={enc.value} value={enc.value}>{enc.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Chọn &quot;Tự động&quot; nếu không chắc. Dùng GBK/GB2312 cho TXT tiếng Trung cũ.
          </p>
        </div>

        {/* Cover */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa (tùy chọn)</label>
          <div className="flex items-start gap-4">
            <input type="file" accept="image/*" onChange={handleCoverChange} className="text-sm" />
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="Cover" className="w-20 h-28 object-cover border rounded" />
            )}
          </div>
        </div>

        {/* Font */}
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700">Font chữ</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useDefaultCjkFont}
              onChange={(e) => {
                setUseDefaultCjkFont(e.target.checked);
                if (e.target.checked) setFontFile(null);
              }}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">
              Nhúng font CJK mặc định (NotoSans SC) — dùng cho truyện Trung/Nhật/Hàn
            </span>
          </label>
          {!useDefaultCjkFont && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Hoặc tải lên font tùy chỉnh (.otf, .ttf, .woff, .woff2):</p>
              <input
                type="file"
                accept=".otf,.ttf,.woff,.woff2"
                onChange={handleFontChange}
                className="text-sm"
              />
              {fontFile && (
                <p className="text-xs text-green-600 mt-1">
                  Đã chọn: {fontFile.name} ({(fontFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>
          )}
          {useDefaultCjkFont && (
            <p className="text-xs text-blue-600">Font NotoSans SC sẽ được tải về và nhúng vào EPUB (~17MB)</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Quay lại</Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>Tiếp tục</Button>
      </div>
    </div>
  );
}
