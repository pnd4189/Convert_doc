# Phase 02: EPUB to DOCX/TXT Tab

## Context Links
- Plan: [plan.md](./plan.md)
- Previous: [phase-01-setup-epub-reader-lib.md](./phase-01-setup-epub-reader-lib.md)
- Next: [phase-03-setup-doc-to-epub-lib.md](./phase-03-setup-doc-to-epub-lib.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | Completed (2024-12-18) |
| Description | Create tab UI for converting EPUB files to DOCX or TXT format |

---

## Key Insights

1. Follow existing tab patterns from `tab-convert-split` and `tab-merge-epub`
2. Stepper with 4 steps: Upload → Configure → Convert → Download
3. Reuse `FileDropzone`, `Stepper`, `Button` components
4. Output format selection (radio: DOCX or TXT)

---

## Requirements

- Upload max 10 EPUB files
- Select output format: DOCX or TXT (Markdown)
- Show conversion progress per file
- Download individual files or ZIP for batch
- Consistent Vietnamese UI labels

---

## Architecture

```
src/components/tab-epub-to-doc/
├── index.tsx             # Main container + state management
├── step-upload.tsx       # Upload EPUB files (max 10)
├── step-configure.tsx    # Select output format (DOCX/TXT)
├── step-convert.tsx      # Processing with progress
└── step-download.tsx     # Download results
```

### State Flow

```typescript
// index.tsx state
interface TabState {
  currentStep: number;           // 0-3
  files: File[];                 // Input EPUB files
  outputFormat: 'docx' | 'txt';  // User selection
  results: ConvertResult[];      // Converted files
  progress: number;              // 0-100
}
```

---

## Related Code Files

| File | Purpose | Reuse |
|------|---------|-------|
| `src/components/tab-convert-split/index.tsx` | Tab pattern | Follow structure |
| `src/components/ui/stepper.tsx` | Stepper component | Use directly |
| `src/components/ui/file-dropzone.tsx` | File upload | Use directly |
| `src/components/ui/button.tsx` | Buttons | Use directly |
| `src/lib/epub-reader/index.ts` | EPUB conversion | Call API |

---

## Implementation Steps

### Step 1: Create index.tsx (Container)

```typescript
// src/components/tab-epub-to-doc/index.tsx

'use client';

import { useState, useCallback } from 'react';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { StepUpload } from './step-upload';
import { StepConfigure } from './step-configure';
import { StepConvert } from './step-convert';
import { StepDownload } from './step-download';
import type { ConvertResult } from '@/lib/epub-reader';

const STEPS = [
  { id: 'upload', title: 'Tải file' },
  { id: 'configure', title: 'Cấu hình' },
  { id: 'convert', title: 'Chuyển đổi' },
  { id: 'download', title: 'Tải về' },
];

export type OutputFormat = 'docx' | 'txt';

export function TabEpubToDoc() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('docx');
  const [results, setResults] = useState<ConvertResult[]>([]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
  }, []);

  const handleFormatSelected = useCallback((format: OutputFormat) => {
    setOutputFormat(format);
    setCurrentStep(2);
  }, []);

  const handleConvertComplete = useCallback((converted: ConvertResult[]) => {
    setResults(converted);
    setCurrentStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFiles([]);
    setOutputFormat('docx');
    setResults([]);
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
          <StepConfigure
            format={outputFormat}
            onFormatChange={setOutputFormat}
            onNext={() => handleFormatSelected(outputFormat)}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <StepConvert
            files={files}
            format={outputFormat}
            onComplete={handleConvertComplete}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepDownload
            results={results}
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
// src/components/tab-epub-to-doc/step-upload.tsx

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
          Bước 1: Tải file EPUB
        </h2>
        <p className="text-gray-600">
          Chọn các file EPUB để chuyển đổi (tối đa 10 file)
        </p>
      </div>

      <FileDropzone
        accept=".epub"
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

### Step 3: Create step-configure.tsx

```typescript
// src/components/tab-epub-to-doc/step-configure.tsx

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 2: Chọn định dạng xuất
        </h2>
        <p className="text-gray-600">
          Chọn định dạng file đầu ra
        </p>
      </div>

      <div className="space-y-4">
        <label className={`
          flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
          ${format === 'docx' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        `}>
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

        <label className={`
          flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
          ${format === 'txt' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        `}>
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
        <Button onClick={onNext}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
```

### Step 4: Create step-convert.tsx

```typescript
// src/components/tab-epub-to-doc/step-convert.tsx

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { batchConvertEpub, ConvertResult } from '@/lib/epub-reader';
import type { OutputFormat } from './index';

export interface StepConvertProps {
  files: File[];
  format: OutputFormat;
  onComplete: (results: ConvertResult[]) => void;
  onBack: () => void;
}

export function StepConvert({ files, format, onComplete, onBack }: StepConvertProps) {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const convert = async () => {
      setIsConverting(true);
      setError(null);

      try {
        const results: ConvertResult[] = [];

        for (let i = 0; i < files.length; i++) {
          setCurrentFile(files[i].name);
          setProgress(Math.round((i / files.length) * 100));

          const result = await batchConvertEpub([files[i]], format);
          results.push(...result);
        }

        setProgress(100);
        onComplete(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Conversion failed');
      } finally {
        setIsConverting(false);
      }
    };

    convert();
  }, [files, format, onComplete]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 3: Đang chuyển đổi
        </h2>
        <p className="text-gray-600">
          Vui lòng đợi trong khi file đang được xử lý
        </p>
      </div>

      <div className="space-y-4">
        <Progress value={progress} />

        <div className="text-center">
          {isConverting && (
            <p className="text-gray-600">
              Đang xử lý: {currentFile} ({progress}%)
            </p>
          )}
          {error && (
            <p className="text-red-600">Lỗi: {error}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            Quay lại
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Create step-download.tsx

```typescript
// src/components/tab-epub-to-doc/step-download.tsx

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
    results.forEach(r => zip.file(r.filename, r.blob));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'converted_files.zip');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bước 4: Tải file về
        </h2>
        <p className="text-gray-600">
          Đã chuyển đổi xong {results.length} file
        </p>
      </div>

      <div className="space-y-2 border rounded-lg divide-y">
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between p-3">
            <span className="text-gray-900">{result.filename}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadSingle(result)}
            >
              Tải xuống
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          Làm lại
        </Button>
        <Button onClick={handleDownloadAll}>
          {results.length === 1 ? 'Tải file' : 'Tải tất cả (ZIP)'}
        </Button>
      </div>
    </div>
  );
}
```

### Step 6: Register Tab in Main App

Update `src/app/page.tsx` or main layout to include new tab:

```typescript
// Add to existing tabs
import { TabEpubToDoc } from '@/components/tab-epub-to-doc';

// In tabs array or component
<TabsContent value="epub-to-doc">
  <TabEpubToDoc />
</TabsContent>
```

---

## Todo List

- [x] Create `src/components/tab-epub-to-doc/` directory
- [x] Implement `index.tsx` - Tab container
- [x] Implement `step-upload.tsx` - File upload
- [x] Implement `step-configure.tsx` - Format selection
- [x] Implement `step-convert.tsx` - Conversion progress
- [x] Implement `step-download.tsx` - Download results
- [x] Register tab in main app
- [x] Test with single and batch files

---

## Success Criteria

1. Tab appears in main navigation
2. EPUB files upload successfully
3. Format selection works (DOCX/TXT)
4. Conversion shows progress
5. Download works for single and batch
6. Reset returns to initial state

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large file UI freeze | Medium | Show progress, process async |
| Download fails | Low | Try/catch with error message |
| Tab styling inconsistent | Low | Follow existing tab patterns exactly |

---

## Security Considerations

- File validation in FileDropzone (accept=".epub")
- No server upload, all client-side
- Sanitize filenames before download

---

## Next Steps

After completion, proceed to [Phase 03: Setup Doc-to-EPUB Lib](./phase-03-setup-doc-to-epub-lib.md)
