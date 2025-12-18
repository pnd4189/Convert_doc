/**
 * Step Export - Generate and download EPUB file
 */

'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  generateEpubWithChapters,
  type EpubMetadata,
  type EpubChapter,
  type DetectedChapter,
} from '@/lib/epub';

export interface StepExportProps {
  metadata: EpubMetadata;
  chapters: DetectedChapter[];
  coverImage: File | null;
  onReset: () => void;
}

export function StepExport({
  metadata,
  chapters,
  coverImage,
  onReset,
}: StepExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);

    try {
      // Convert DetectedChapter to EpubChapter
      const epubChapters: EpubChapter[] = chapters.map((ch) => ({
        index: ch.index,
        title: ch.title,
        content: ch.content,
      }));

      setProgress(30);

      // Add cover image to metadata if provided
      const finalMetadata: EpubMetadata = {
        ...metadata,
        coverImage: coverImage,
      };

      setProgress(50);

      const blob = await generateEpubWithChapters(finalMetadata, epubChapters);

      setProgress(100);
      setEpubBlob(blob);
      setDownloadReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (epubBlob) {
      const filename = `${metadata.title}.epub`;
      saveAs(epubBlob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 5: Xuất file EPUB
        </h2>
        <p className="text-gray-600">
          {downloadReady
            ? 'File EPUB đã sẵn sàng để tải về!'
            : 'Nhấn nút để tạo file EPUB'}
        </p>
      </div>

      {!downloadReady && !isGenerating && (
        <div className="text-center py-8">
          <Button size="lg" onClick={handleGenerate}>
            Tạo file EPUB
          </Button>
        </div>
      )}

      {isGenerating && (
        <div className="space-y-4 py-8">
          <Progress value={progress} />
          <p className="text-center text-gray-600">Đang tạo file EPUB...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <Button variant="outline" onClick={handleGenerate}>
            Thử lại
          </Button>
        </div>
      )}

      {downloadReady && (
        <div className="text-center py-8 space-y-4">
          <div className="text-6xl">✓</div>
          <p className="text-lg font-medium text-gray-900">Tạo thành công!</p>
          <Button size="lg" onClick={handleDownload}>
            Tải {metadata.title}.epub
          </Button>
        </div>
      )}

      <div className="flex justify-start">
        <Button variant="outline" onClick={onReset}>
          Làm lại từ đầu
        </Button>
      </div>
    </div>
  );
}
