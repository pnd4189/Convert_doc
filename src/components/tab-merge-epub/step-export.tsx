/**
 * Step Export - Export merged content as TXT or EPUB
 * With metadata inputs, cover upload, and language selector
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { generateEpubWithChapters, detectChapters } from '@/lib/epub';
import { saveAs } from 'file-saver';

/** Language options for EPUB */
const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

export interface StepExportProps {
  content: string;
  defaultName: string;
  onReset: () => void;
}

export function StepExport({ content, defaultName, onReset }: StepExportProps) {
  const [fileName, setFileName] = useState(defaultName);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedFormat, setExportedFormat] = useState<'txt' | 'epub' | null>(null);
  const [error, setError] = useState<string>();

  // Metadata state
  const [author, setAuthor] = useState('');
  const [translator, setTranslator] = useState('');
  const [language, setLanguage] = useState('vi');
  const [showMetadata, setShowMetadata] = useState(false);

  // Cover image state
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Cleanup cover preview URL on unmount
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous preview URL
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverImage(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleExportTxt = useCallback(() => {
    setIsExporting(true);
    setProgress(50);
    setError(undefined);

    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
      setProgress(100);
      setExportedFormat('txt');
    } catch (e) {
      setError((e as Error).message || 'Có lỗi khi tạo file TXT');
    } finally {
      setIsExporting(false);
    }
  }, [content, fileName]);

  const handleExportEpub = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);
    setError(undefined);

    try {
      setProgress(20);

      // Detect chapters from content
      const chapters = detectChapters(content);
      setProgress(40);

      // Build metadata
      const metadata = {
        title: fileName,
        author: author || undefined,
        translator: translator || undefined,
        language,
        coverImage: coverImage || undefined,
      };

      setProgress(60);

      // Generate EPUB with chapters
      const blob = await generateEpubWithChapters(metadata, chapters);
      setProgress(90);

      saveAs(blob, `${fileName}.epub`);
      setProgress(100);
      setExportedFormat('epub');
    } catch (e) {
      setError((e as Error).message || 'Có lỗi khi tạo file EPUB');
    } finally {
      setIsExporting(false);
    }
  }, [content, fileName, author, translator, language, coverImage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bước 4: Xuất file</h2>
        <p className="text-gray-600">Chọn định dạng file muốn tải về</p>
      </div>

      {/* File name input */}
      <div className="max-w-md">
        <Input
          label="Tên file (không cần đuôi)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="ten-file"
        />
      </div>

      {/* Collapsible Metadata Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMetadata(!showMetadata)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-700">
            Thông tin sách (optional)
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${showMetadata ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMetadata && (
          <div className="p-4 space-y-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tác giả"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tên tác giả"
              />
              <Input
                label="Dịch giả"
                value={translator}
                onChange={(e) => setTranslator(e.target.value)}
                placeholder="Tên dịch giả (nếu có)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngôn ngữ
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cover Image Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <label className="block font-medium text-gray-700">
          Ảnh bìa (optional)
        </label>

        <div className="flex items-start gap-4">
          {/* Upload button */}
          <div className="flex-shrink-0">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="hidden"
              id="cover-upload"
            />
            <label
              htmlFor="cover-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Chọn ảnh bìa
            </label>
          </div>

          {/* Preview */}
          {coverPreview && (
            <div className="relative">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-32 w-auto rounded border shadow-sm"
              />
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                title="Xóa ảnh bìa"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Khuyến nghị: 1600×2560px (ratio 5:8) • Hỗ trợ: JPG, PNG, WebP
        </p>
      </div>

      {/* Progress & Status */}
      {isExporting && (
        <Progress value={progress} label="Đang tạo file..." />
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>❌ {error}</p>
        </div>
      )}

      {exportedFormat && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg">
          <p>✓ Đã tải xuống <strong>{fileName}.{exportedFormat}</strong></p>
        </div>
      )}

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleExportTxt}
          disabled={isExporting || !fileName}
          className="
            flex flex-col items-center justify-center p-6 border-2 rounded-lg
            hover:border-blue-500 hover:bg-blue-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-gray-700">Tải file TXT</span>
          <span className="text-sm text-gray-500">Plain text</span>
        </button>

        <button
          onClick={handleExportEpub}
          disabled={isExporting || !fileName}
          className="
            flex flex-col items-center justify-center p-6 border-2 rounded-lg
            hover:border-blue-500 hover:bg-blue-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-medium text-gray-700">Chuyển sang EPUB</span>
          <span className="text-sm text-gray-500">E-book format</span>
        </button>
      </div>

      {/* Reset Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onReset}>
          ↻ Làm lại từ đầu
        </Button>
      </div>
    </div>
  );
}
