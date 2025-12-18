# Phase 04: DOCX/TXT to EPUB Tab

## Context Links
- Plan: [plan.md](./plan.md)
- Previous: [phase-03-setup-doc-to-epub-lib.md](./phase-03-setup-doc-to-epub-lib.md)
- Next: [phase-05-integration-and-testing.md](./phase-05-integration-and-testing.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - High |
| Status | Completed (2024-12-18) |
| Description | Create tab UI for converting DOCX/TXT files to EPUB format |

---

## Key Insights

1. More steps than Tab 1: Upload → Metadata → Chapters → Preview → Export
2. Reuse patterns from `tab-merge-epub` (has preview and reorder)
3. Chapter editing/reordering before EPUB generation
4. Cover image optional (reuse existing cover-handler)

---

## Requirements

- Upload max 10 DOCX/TXT files
- Enter book metadata (title, author, translator)
- Review and reorder detected chapters
- Preview final structure before export
- Generate valid EPUB3 with optional cover

---

## Architecture

```
src/components/tab-doc-to-epub/
├── index.tsx             # Main container + state
├── step-upload.tsx       # Upload DOCX/TXT files
├── step-metadata.tsx     # Enter book metadata + cover
├── step-chapters.tsx     # Review/reorder chapters
├── step-preview.tsx      # Preview EPUB structure
└── step-export.tsx       # Generate & download EPUB
```

### State Flow

```typescript
interface TabState {
  currentStep: number;        // 0-4
  files: File[];              // Input files
  metadata: EpubMetadata;     // Title, author, etc.
  chapters: DetectedChapter[]; // Detected/edited chapters
  coverImage: File | null;    // Optional cover
}
```

---

## Related Code Files

| File | Purpose | Reuse |
|------|---------|-------|
| `src/components/tab-merge-epub/index.tsx` | Tab pattern with preview | Follow structure |
| `src/components/tab-merge-epub/step-reorder.tsx` | Reorder pattern | Reference for chapters step |
| `src/lib/doc-to-epub/index.ts` | Document processing | Call API |
| `src/lib/epub/index.ts` | EPUB generation | Use generateEpubWithChapters |

---

## Implementation Steps

### Step 1: Create index.tsx

```typescript
// src/components/tab-doc-to-epub/index.tsx

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepMetadata } from './step-metadata';
import { StepChapters } from './step-chapters';
import { StepPreview } from './step-preview';
import { StepExport } from './step-export';
import type { EpubMetadata, DetectedChapter } from '@/lib/epub';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'metadata', title: 'Thông tin' },
  { id: 'chapters', title: 'Chương' },
  { id: 'preview', title: 'Xem trước' },
  { id: 'export', title: 'Xuất file' },
];

export function TabDocToEpub() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<EpubMetadata>({
    title: '',
    author: '',
    language: 'vi',
  });
  const [chapters, setChapters] = useState<DetectedChapter[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Auto-fill title from first file
    if (selectedFiles.length > 0) {
      const name = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
      setMetadata(prev => ({ ...prev, title: name }));
    }
  }, []);

  const handleMetadataComplete = useCallback((meta: EpubMetadata, cover: File | null) => {
    setMetadata(meta);
    setCoverImage(cover);
    setCurrentStep(2);
  }, []);

  const handleChaptersDetected = useCallback((detected: DetectedChapter[]) => {
    setChapters(detected);
  }, []);

  const handleChaptersConfirmed = useCallback((confirmed: DetectedChapter[]) => {
    setChapters(confirmed);
    setCurrentStep(3);
  }, []);

  const handlePreviewConfirm = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setMetadata({ title: '', author: '', language: 'vi' });
    setChapters([]);
    setCoverImage(null);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step <= currentStep) setCurrentStep(step);
  }, [currentStep]);

  return (
    <div>
      <Stepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

      <StepContent>
        {currentStep === 0 && (
          <StepUpload
            files={files}
            onFilesChange={handleFilesSelected}
            onNext={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 1 && (
          <StepMetadata
            metadata={metadata}
            coverImage={coverImage}
            onComplete={handleMetadataComplete}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepChapters
            files={files}
            onChaptersDetected={handleChaptersDetected}
            onConfirm={handleChaptersConfirmed}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepPreview
            metadata={metadata}
            chapters={chapters}
            onNext={handlePreviewConfirm}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepExport
            metadata={metadata}
            chapters={chapters}
            coverImage={coverImage}
            onReset={handleReset}
          />
        )}
      </StepContent>
    </div>
  );
}
```

### Step 2: Create step-upload.tsx

```typescript
// src/components/tab-doc-to-epub/step-upload.tsx

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
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 1: Tải file lên
        </h2>
        <p className="text-gray-600">
          Chọn các file DOCX hoặc TXT để chuyển thành EPUB (tối đa 10 file)
        </p>
      </div>

      <FileDropzone
        accept=".docx,.txt"
        multiple
        maxFiles={10}
        onFilesSelected={onFilesChange}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={files.length === 0}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
```

### Step 3: Create step-metadata.tsx

```typescript
// src/components/tab-doc-to-epub/step-metadata.tsx

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

export function StepMetadata({ metadata, coverImage, onComplete, onBack }: StepMetadataProps) {
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
        <p className="text-gray-600">
          Nhập thông tin metadata cho file EPUB
        </p>
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
```

### Step 4: Create step-chapters.tsx

```typescript
// src/components/tab-doc-to-epub/step-chapters.tsx

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { processDocument, type ProcessedDocument } from '@/lib/doc-to-epub';
import type { DetectedChapter } from '@/lib/epub';

export interface StepChaptersProps {
  files: File[];
  onChaptersDetected: (chapters: DetectedChapter[]) => void;
  onConfirm: (chapters: DetectedChapter[]) => void;
  onBack: () => void;
}

export function StepChapters({ files, onChaptersDetected, onConfirm, onBack }: StepChaptersProps) {
  const [chapters, setChapters] = useState<DetectedChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detect = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allChapters: DetectedChapter[] = [];
        let index = 1;

        for (const file of files) {
          const processed = await processDocument(file);
          processed.chapters.forEach(ch => {
            allChapters.push({ ...ch, index: index++ });
          });
        }

        setChapters(allChapters);
        onChaptersDetected(allChapters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Detection failed');
      } finally {
        setIsLoading(false);
      }
    };

    detect();
  }, [files, onChaptersDetected]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newChapters = [...chapters];
    [newChapters[index - 1], newChapters[index]] = [newChapters[index], newChapters[index - 1]];
    // Re-index
    newChapters.forEach((ch, i) => { ch.index = i + 1; });
    setChapters(newChapters);
  };

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const newChapters = [...chapters];
    [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    newChapters.forEach((ch, i) => { ch.index = i + 1; });
    setChapters(newChapters);
  };

  const handleRemove = (index: number) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    newChapters.forEach((ch, i) => { ch.index = i + 1; });
    setChapters(newChapters);
  };

  const handleConfirm = () => {
    onConfirm(chapters);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Đang phân tích nội dung...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Lỗi: {error}</p>
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 3: Xem xét chương
        </h2>
        <p className="text-gray-600">
          Đã phát hiện {chapters.length} chương. Bạn có thể sắp xếp lại hoặc xóa.
        </p>
      </div>

      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
        {chapters.map((chapter, index) => (
          <div key={chapter.index} className="flex items-center justify-between p-3">
            <div className="flex-1">
              <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
              <span className="font-medium">{chapter.title}</span>
              <span className="text-xs text-gray-400 ml-2">
                ({chapter.content.length} ký tự)
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === chapters.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={handleConfirm} disabled={chapters.length === 0}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
```

### Step 5: Create step-preview.tsx

```typescript
// src/components/tab-doc-to-epub/step-preview.tsx

'use client';

import { Button } from '@/components/ui/button';
import type { EpubMetadata, DetectedChapter } from '@/lib/epub';

export interface StepPreviewProps {
  metadata: EpubMetadata;
  chapters: DetectedChapter[];
  onNext: () => void;
  onBack: () => void;
}

export function StepPreview({ metadata, chapters, onNext, onBack }: StepPreviewProps) {
  const totalChars = chapters.reduce((sum, ch) => sum + ch.content.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 4: Xem trước
        </h2>
        <p className="text-gray-600">
          Kiểm tra thông tin trước khi xuất file EPUB
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Tên sách:</span>
            <p className="font-medium">{metadata.title}</p>
          </div>
          <div>
            <span className="text-gray-500">Tác giả:</span>
            <p className="font-medium">{metadata.author || '(Không có)'}</p>
          </div>
          <div>
            <span className="text-gray-500">Số chương:</span>
            <p className="font-medium">{chapters.length}</p>
          </div>
          <div>
            <span className="text-gray-500">Tổng ký tự:</span>
            <p className="font-medium">{totalChars.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <span className="text-gray-500 text-sm">Mục lục:</span>
          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {chapters.map((ch, i) => (
              <li key={i} className="text-sm">
                <span className="text-gray-400">{i + 1}.</span> {ch.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={onNext}>
          Xuất EPUB
        </Button>
      </div>
    </div>
  );
}
```

### Step 6: Create step-export.tsx

```typescript
// src/components/tab-doc-to-epub/step-export.tsx

'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { generateEpubWithChapters, type EpubMetadata, type EpubChapter, type DetectedChapter } from '@/lib/epub';

export interface StepExportProps {
  metadata: EpubMetadata;
  chapters: DetectedChapter[];
  coverImage: File | null;
  onReset: () => void;
}

export function StepExport({ metadata, chapters, coverImage, onReset }: StepExportProps) {
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
      const epubChapters: EpubChapter[] = chapters.map(ch => ({
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
          <p className="text-center text-gray-600">
            Đang tạo file EPUB...
          </p>
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
          <p className="text-lg font-medium text-gray-900">
            Tạo thành công!
          </p>
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
```

### Step 7: Register Tab in Main App

Update `src/app/page.tsx` to include new tab:

```typescript
import { TabDocToEpub } from '@/components/tab-doc-to-epub';

// In tabs
<TabsContent value="doc-to-epub">
  <TabDocToEpub />
</TabsContent>
```

---

## Todo List

- [x] Create `src/components/tab-doc-to-epub/` directory
- [x] Implement `index.tsx` - Tab container
- [x] Implement `step-upload.tsx` - File upload
- [x] Implement `step-metadata.tsx` - Metadata + cover
- [x] Implement `step-chapters.tsx` - Chapter review/reorder
- [x] Implement `step-preview.tsx` - Final preview
- [x] Implement `step-export.tsx` - EPUB generation
- [x] Register tab in main app
- [x] Test full flow with DOCX and TXT files

---

## Success Criteria

1. Tab appears in main navigation
2. DOCX and TXT files upload successfully
3. Metadata form works with validation
4. Chapter detection and reordering works
5. Preview shows accurate summary
6. EPUB downloads successfully
7. Generated EPUB opens in e-readers

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Chapter detection misses chapters | Medium | Allow manual chapter creation |
| Large file UI freeze | Medium | Show progress indicators |
| Cover image too large | Low | Cover handler auto-resizes |
| Invalid EPUB output | Medium | Test with multiple readers |

---

## Security Considerations

- Validate file types (accept=".docx,.txt")
- Cover image validated by cover-handler
- All processing client-side

---

## Next Steps

After completion, proceed to [Phase 05: Integration and Testing](./phase-05-integration-and-testing.md)
