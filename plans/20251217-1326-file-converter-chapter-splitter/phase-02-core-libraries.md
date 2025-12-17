# Phase 02: Core Libraries

**Parent:** [plan.md](./plan.md)
**Depends on:** Phase 01
**Status:** Pending
**Priority:** High

---

## Overview

Implement các utility libraries xử lý file: chapter parser, docx converter, epub generator, zip builder.

---

## Requirements

### Functional
- Parse text để detect chapters (preset + custom regex)
- Convert TXT ↔ DOCX
- Generate EPUB từ text content
- Bundle files thành ZIP

### Non-Functional
- Browser-compatible (no Node.js APIs)
- Memory efficient cho file lớn
- Progress callback support

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/chapter-parser.ts` | Chapter detection logic |
| `src/lib/docx-converter.ts` | TXT ↔ DOCX conversion |
| `src/lib/epub-generator.ts` | EPUB creation |
| `src/lib/zip-builder.ts` | ZIP packaging |
| `src/lib/file-processor.ts` | Orchestration utils |

---

## Implementation Steps

### Step 1: chapter-parser.ts

```typescript
// Preset patterns cho Vietnamese novels
export const PRESET_PATTERNS = [
  { id: 'chuong', name: 'Chương X', pattern: /^Chương\s+\d+/im },
  { id: 'chuong-upper', name: 'CHƯƠNG X', pattern: /^CHƯƠNG\s+\d+/im },
  { id: 'chapter', name: 'Chapter X', pattern: /^Chapter\s+\d+/im },
  { id: 'hoi', name: 'Hồi X', pattern: /^Hồi\s+\d+/im },
  { id: 'quyen-chuong', name: 'Quyển X Chương Y', pattern: /^Quyển\s+\d+.*Chương\s+\d+/im },
];

export interface Chapter {
  index: number;
  title: string;
  startLine: number;
  endLine: number;
  content: string;
}

export function parseChapters(text: string, pattern: RegExp): Chapter[];
export function validatePattern(patternStr: string): { valid: boolean; error?: string };
export function getPreviewChapters(chapters: Chapter[], count?: number): Chapter[];
```

### Step 2: docx-converter.ts

```typescript
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function docxToText(file: File): Promise<string>;
export async function textToDocx(text: string, filename: string): Promise<Blob>;
export async function readFileAsText(file: File): Promise<string>;
```

### Step 3: epub-generator.ts

```typescript
import Epub from 'epub-gen-memory';

export interface EpubOptions {
  title: string;
  content: string;
}

export async function generateEpub(options: EpubOptions): Promise<Blob>;
```

### Step 4: zip-builder.ts

```typescript
import JSZip from 'jszip';

export interface ZipFile {
  name: string;
  content: string | Blob;
}

export async function createZip(
  files: ZipFile[],
  onProgress?: (percent: number) => void
): Promise<Blob>;
```

### Step 5: file-processor.ts

```typescript
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  content?: string;
}

export async function processFiles(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<FileInfo[]>;

export function splitByChapters(
  content: string,
  chapters: Chapter[],
  chaptersPerFile: number,
  baseName: string
): ZipFile[];

export function mergeFiles(files: FileInfo[]): string;
```

---

## Todo List

- [ ] Create chapter-parser.ts với preset patterns
- [ ] Implement validatePattern cho custom regex
- [ ] Create docx-converter.ts (mammoth + docx)
- [ ] Create epub-generator.ts
- [ ] Create zip-builder.ts với progress
- [ ] Create file-processor.ts orchestration
- [ ] Add TypeScript types

---

## Success Criteria

- All functions exported and typed
- Unit tests pass (if added)
- No Node.js specific APIs used

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| mammoth browser compat | Use ArrayBuffer input |
| epub-gen-memory fails | Test early, have fallback |
| Large file memory | Implement chunked processing |

---

## Next Steps

→ Phase 03: Shared UI Components
