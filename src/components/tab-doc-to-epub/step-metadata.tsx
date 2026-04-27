/**
 * Step Metadata - Enter book metadata, optional cover image and font file
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EpubMetadata } from '@/lib/epub';

export interface StepMetadataProps {
  metadata: EpubMetadata;
  coverImage: File | null;
  fontFile: File | null;
  onComplete: (metadata: EpubMetadata, cover: File | null, font: File | null) => void;
  onBack: () => void;
}

export function StepMetadata({
  metadata,
  coverImage,
  fontFile: initialFont,
  onComplete,
  onBack,
}: StepMetadataProps) {
  const [title, setTitle] = useState(metadata.title);
  const [author, setAuthor] = useState(metadata.author || '');
  const [translator, setTranslator] = useState(metadata.translator || '');
  const [cover, setCover] = useState<File | null>(coverImage);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [font, setFont] = useState<File | null>(initialFont);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File font quá lớn (>10MB). Vui lòng chọn file nhỏ hơn.');
        return;
      }
      setFont(file);
    }
  };

  const [language, setLanguage] = useState(metadata.language || 'vi');

  const handleSubmit = () => {
    const meta: EpubMetadata = {
      title: title.trim() || 'Untitled',
      author: author.trim() || undefined,
      translator: translator.trim() || undefined,
      language,
      coverImage: cover,
    };
    onComplete(meta, cover, font);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 2: Thông tin sách
        </h2>
        <p className="text-gray-600">Nhập thông tin metadata cho file EPUB</p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sách *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên sách"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tác giả
          </label>
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nhập tên tác giả"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dịch giả
          </label>
          <Input
            value={translator}
            onChange={(e) => setTranslator(e.target.value)}
            placeholder="Nhập tên dịch giả (nếu có)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngôn ngữ
          </label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh bìa (tùy chọn)
          </label>
          <div className="flex items-start gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-sm"
            />
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-20 h-28 object-cover border rounded"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font chữ (tùy chọn)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Hỗ trợ .otf, .ttf, .woff, .woff2. Nhúng font vào EPUB cho tiếng Trung/Nhật/Hàn.
          </p>
          <input
            type="file"
            accept=".otf,.ttf,.woff,.woff2"
            onChange={handleFontChange}
            className="text-sm"
          />
          {font && (
            <p className="text-xs text-green-600 mt-1">
              Đã chọn: {font.name} ({(font.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
          {font && font.size > 5 * 1024 * 1024 && (
            <p className="text-xs text-amber-600 mt-1">
              Font lớn có thể làm file EPUB nặng hơn.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
