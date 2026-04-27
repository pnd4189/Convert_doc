/**
 * TXT to EPUB - Step Export: Generate EPUB with optional CJK font embedding
 */

'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { generateEpubWithChapters, type EpubMetadata, type EpubChapter, type DetectedChapter } from '@/lib/epub';

interface StepExportProps {
  metadata: EpubMetadata;
  chapters: DetectedChapter[];
  coverImage: File | null;
  fontFile: File | null;
  useDefaultCjkFont: boolean;
  onReset: () => void;
}

async function loadDefaultCjkFont(): Promise<File> {
  const res = await fetch('/fonts/NotoSansSC-Regular.ttf');
  if (!res.ok) throw new Error('Không thể tải font CJK mặc định');
  const blob = await res.blob();
  return new File([blob], 'NotoSansSC-Regular.ttf', { type: 'font/ttf' });
}

export function StepExport({ metadata, chapters, coverImage, fontFile, useDefaultCjkFont, onReset }: StepExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);

    try {
      let resolvedFont: File | null = fontFile;

      if (useDefaultCjkFont) {
        setProgressLabel('Đang tải font CJK (~17MB)...');
        setProgress(20);
        resolvedFont = await loadDefaultCjkFont();
      }

      setProgressLabel('Đang tạo EPUB...');
      setProgress(50);

      const epubChapters: EpubChapter[] = chapters.map((ch) => ({
        index: ch.index,
        title: ch.title,
        content: ch.content,
      }));

      const finalMetadata: EpubMetadata = { ...metadata, coverImage };
      const blob = await generateEpubWithChapters(finalMetadata, epubChapters, { fontFile: resolvedFont });

      setProgress(100);
      setProgressLabel('');
      setEpubBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo EPUB');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (epubBlob) saveAs(epubBlob, `${metadata.title}.epub`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 4: Xuất file EPUB</h2>
        <p className="text-gray-600">
          {epubBlob ? 'File EPUB đã sẵn sàng!' : 'Nhấn nút để tạo file EPUB'}
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-1 text-gray-700">
        <p><strong>Tên sách:</strong> {metadata.title}</p>
        {metadata.author && <p><strong>Tác giả:</strong> {metadata.author}</p>}
        {metadata.translator && <p><strong>Dịch giả:</strong> {metadata.translator}</p>}
        <p><strong>Ngôn ngữ:</strong> {metadata.language}</p>
        <p><strong>Số chương:</strong> {chapters.length}</p>
        {useDefaultCjkFont && <p><strong>Font:</strong> NotoSans SC (CJK mặc định)</p>}
        {fontFile && !useDefaultCjkFont && <p><strong>Font:</strong> {fontFile.name}</p>}
        {coverImage && <p><strong>Bìa:</strong> {coverImage.name}</p>}
      </div>

      {!epubBlob && !isGenerating && (
        <div className="text-center py-6">
          <Button size="lg" onClick={handleGenerate}>Tạo file EPUB</Button>
        </div>
      )}

      {isGenerating && (
        <div className="space-y-3 py-6">
          <Progress value={progress} />
          <p className="text-center text-gray-600 text-sm">{progressLabel || 'Đang tạo file EPUB...'}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 space-y-3">
          <p className="text-red-600">Lỗi: {error}</p>
          <Button variant="outline" onClick={handleGenerate}>Thử lại</Button>
        </div>
      )}

      {epubBlob && (
        <div className="text-center py-6 space-y-4">
          <div className="text-5xl">✓</div>
          <p className="text-lg font-medium text-gray-900">Tạo thành công!</p>
          <Button size="lg" onClick={handleDownload}>Tải {metadata.title}.epub</Button>
        </div>
      )}

      <div className="flex justify-start">
        <Button variant="outline" onClick={onReset}>Làm lại từ đầu</Button>
      </div>
    </div>
  );
}
