/**
 * Step Metadata - Enter book metadata and optional cover image
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EpubMetadata } from '@/lib/epub';

export interface StepMetadataProps {
  metadata: EpubMetadata;
  coverImage: File | null;
  onComplete: (metadata: EpubMetadata, cover: File | null) => void;
  onBack: () => void;
}

export function StepMetadata({
  metadata,
  coverImage,
  onComplete,
  onBack,
}: StepMetadataProps) {
  const [title, setTitle] = useState(metadata.title);
  const [author, setAuthor] = useState(metadata.author || '');
  const [translator, setTranslator] = useState(metadata.translator || '');
  const [cover, setCover] = useState<File | null>(coverImage);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const meta: EpubMetadata = {
      title: title.trim() || 'Untitled',
      author: author.trim() || undefined,
      translator: translator.trim() || undefined,
      language: 'vi',
      coverImage: cover,
    };
    onComplete(meta, cover);
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
