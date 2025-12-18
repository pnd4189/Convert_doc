# Phase 03: Setup Doc-to-EPUB Library

## Context Links
- Plan: [plan.md](./plan.md)
- Previous: [phase-02-epub-to-docx-txt-tab.md](./phase-02-epub-to-docx-txt-tab.md)
- Next: [phase-04-doc-to-epub-tab.md](./phase-04-doc-to-epub-tab.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - High |
| Status | Pending |
| Description | Create doc-to-epub lib to convert DOCX/TXT files to HTML for EPUB generation |

---

## Key Insights

1. `mammoth` already in project - use for DOCX → HTML
2. Add `marked` for Markdown → HTML
3. Reuse existing `src/lib/epub/` for EPUB generation
4. Simple wrapper pattern - thin adapter layer

---

## Requirements

- Convert DOCX to clean HTML (preserve formatting)
- Convert TXT (plain or Markdown) to HTML
- Auto-detect Markdown patterns in TXT
- Output compatible with existing chapter-detector
- Batch support for multiple files

---

## Architecture

```
src/lib/doc-to-epub/
├── index.ts              # Main orchestrator: convertDocsToEpub()
├── docx-processor.ts     # DOCX → HTML (mammoth wrapper)
└── txt-processor.ts      # TXT/Markdown → HTML (marked.js)
```

### Dependencies

```json
{
  "dependencies": {
    "marked": "^15.0.0"
  },
  "devDependencies": {
    "@types/marked": "^6.0.0"
  }
}
```

---

## Related Code Files

| File | Purpose | Reuse |
|------|---------|-------|
| `src/lib/epub/index.ts` | EPUB generation | Use `generateEpubWithChapters()` |
| `src/lib/epub/chapter-detector.ts` | Chapter detection | Use `detectChapters()` |
| `src/lib/epub/types.ts` | Type definitions | Use `EpubMetadata`, `EpubChapter` |
| `package.json` | Current deps | Has mammoth |

---

## Implementation Steps

### Step 0: Install marked

```bash
npm install marked
npm install -D @types/marked
```

### Step 1: Create docx-processor.ts

```typescript
// src/lib/doc-to-epub/docx-processor.ts

import mammoth from 'mammoth';

export interface DocxProcessResult {
  html: string;
  messages: string[];
}

/**
 * Convert DOCX file to HTML using mammoth
 */
export async function processDocx(file: File): Promise<DocxProcessResult> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        // Map DOCX styles to semantic HTML
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
      ],
    }
  );

  return {
    html: result.value,
    messages: result.messages.map(m => m.message),
  };
}

/**
 * Batch process multiple DOCX files
 */
export async function batchProcessDocx(files: File[]): Promise<string[]> {
  const htmls: string[] = [];

  for (const file of files) {
    const result = await processDocx(file);
    htmls.push(result.html);
  }

  return htmls;
}
```

### Step 2: Create txt-processor.ts

```typescript
// src/lib/doc-to-epub/txt-processor.ts

import { marked } from 'marked';

/**
 * Detect if text content is Markdown formatted
 * Checks for common Markdown patterns
 */
function isMarkdown(text: string): boolean {
  const patterns = [
    /^#{1,6}\s+/m,           // # Heading
    /\*\*[^*]+\*\*/,         // **bold**
    /\*[^*]+\*/,             // *italic*
    /^[-*]\s+/m,             // - list or * list
    /^\d+\.\s+/m,            // 1. numbered list
    /\[.+\]\(.+\)/,          // [link](url)
    /^>\s+/m,                // > blockquote
    /`[^`]+`/,               // `code`
    /^\|.+\|$/m,             // | table |
  ];

  // If 2+ patterns match, likely Markdown
  let matches = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      matches++;
      if (matches >= 2) return true;
    }
  }

  return false;
}

/**
 * Convert plain text to HTML
 * Wraps paragraphs in <p> tags
 */
function plainTextToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

export interface TxtProcessResult {
  html: string;
  isMarkdown: boolean;
}

/**
 * Convert TXT file to HTML
 * Auto-detects Markdown and uses appropriate parser
 */
export async function processTxt(file: File): Promise<TxtProcessResult> {
  const text = await file.text();

  if (isMarkdown(text)) {
    // Use marked for Markdown parsing
    const html = await marked.parse(text, {
      gfm: true,        // GitHub Flavored Markdown
      breaks: true,     // Convert \n to <br>
    });

    return { html, isMarkdown: true };
  }

  // Plain text - simple paragraph wrapping
  const html = plainTextToHtml(text);
  return { html, isMarkdown: false };
}

/**
 * Batch process multiple TXT files
 */
export async function batchProcessTxt(files: File[]): Promise<string[]> {
  const htmls: string[] = [];

  for (const file of files) {
    const result = await processTxt(file);
    htmls.push(result.html);
  }

  return htmls;
}
```

### Step 3: Create index.ts (Orchestrator)

```typescript
// src/lib/doc-to-epub/index.ts

import { processDocx } from './docx-processor';
import { processTxt } from './txt-processor';
import {
  generateEpubWithChapters,
  detectChapters,
  type EpubMetadata,
  type EpubChapter,
  type DetectedChapter,
} from '@/lib/epub';

export interface DocToEpubOptions {
  file: File;
  metadata: EpubMetadata;
}

export interface ProcessedDocument {
  file: File;
  html: string;
  chapters: DetectedChapter[];
}

/**
 * Process a single document file to HTML + detected chapters
 */
export async function processDocument(file: File): Promise<ProcessedDocument> {
  const ext = file.name.toLowerCase().split('.').pop();
  let html: string;

  if (ext === 'docx') {
    const result = await processDocx(file);
    html = result.html;
  } else if (ext === 'txt') {
    const result = await processTxt(file);
    html = result.html;
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // Detect chapters from HTML content
  // Convert HTML to plain text for chapter detection
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  const chapters = detectChapters(textContent);

  return { file, html, chapters };
}

/**
 * Convert document to EPUB
 */
export async function convertDocToEpub(options: DocToEpubOptions): Promise<Blob> {
  const { file, metadata } = options;

  const processed = await processDocument(file);

  // Build EpubChapter array from detected chapters
  const epubChapters: EpubChapter[] = processed.chapters.map(ch => ({
    index: ch.index,
    title: ch.title,
    content: ch.content,
  }));

  // Generate EPUB using existing lib
  const blob = await generateEpubWithChapters(metadata, epubChapters);

  return blob;
}

/**
 * Batch convert multiple documents to single EPUB
 * Combines all content into chapters
 */
export async function batchConvertDocsToEpub(
  files: File[],
  metadata: EpubMetadata
): Promise<Blob> {
  const allChapters: EpubChapter[] = [];
  let chapterIndex = 1;

  for (const file of files) {
    const processed = await processDocument(file);

    // Add file's chapters with adjusted indices
    processed.chapters.forEach(ch => {
      allChapters.push({
        index: chapterIndex++,
        title: ch.title,
        content: ch.content,
      });
    });
  }

  return generateEpubWithChapters(metadata, allChapters);
}

/**
 * Convert each document to separate EPUB
 */
export async function batchConvertDocsToSeparateEpubs(
  files: File[],
  metadataBase: Partial<EpubMetadata>
): Promise<{ filename: string; blob: Blob }[]> {
  const results: { filename: string; blob: Blob }[] = [];

  for (const file of files) {
    const title = file.name.replace(/\.[^/.]+$/, '');
    const metadata: EpubMetadata = {
      title,
      ...metadataBase,
    };

    const blob = await convertDocToEpub({ file, metadata });
    const filename = `${title}.epub`;

    results.push({ filename, blob });
  }

  return results;
}

// Re-export types and utilities
export { processDocx } from './docx-processor';
export { processTxt } from './txt-processor';
export type { DocxProcessResult } from './docx-processor';
export type { TxtProcessResult } from './txt-processor';
```

---

## Todo List

- [ ] Install `marked` and `@types/marked` dependencies
- [ ] Create `src/lib/doc-to-epub/` directory
- [ ] Implement `docx-processor.ts` - DOCX → HTML
- [ ] Implement `txt-processor.ts` - TXT/Markdown → HTML
- [ ] Implement `index.ts` - Orchestrator
- [ ] Add unit tests for Markdown detection
- [ ] Test with sample DOCX and TXT files

---

## Success Criteria

1. DOCX converts to clean HTML with preserved headings, bold, italic, lists
2. Markdown TXT converts correctly via marked.js
3. Plain TXT wraps paragraphs properly
4. Chapter detection works on converted content
5. EPUB generation produces valid EPUB3

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| mammoth missing styles | Low | Add styleMap for common cases |
| Markdown detection false positive | Low | Require 2+ patterns |
| Large file memory | Medium | Process one file at a time |
| Chapter detection fails | Low | Falls back to single chapter |

---

## Security Considerations

- Sanitize HTML from mammoth before display
- marked.js has XSS protection by default
- No server-side processing

---

## Next Steps

After completion, proceed to [Phase 04: Doc-to-EPUB Tab](./phase-04-doc-to-epub-tab.md)
