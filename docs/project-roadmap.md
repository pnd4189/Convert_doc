# Project Roadmap

**Last Updated:** 2026-04-25

## Completed Milestones

### Phase 1: Core Application
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| Next.js 16 project setup with static export | Done |
| Tab-based UI (4 tabs) | Done |
| Shared UI components (stepper, file-dropzone, tabs, button, input, select, progress) | Done |
| File upload and reading (TXT, DOCX) | Done |
| Vietnamese language UI | Done |

### Phase 2: Convert & Split
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| File upload for TXT/DOCX | Done |
| DOCX to text conversion (mammoth) | Done |
| Chapter detection with 24 preset patterns (VN/CN/EN) | Done |
| Custom regex support | Done |
| Chapter preview and range filtering | Done |
| Split into multiple files with configurable chapters-per-file | Done |
| ZIP download | Done |

### Phase 3: Merge & EPUB
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| Multi-file upload | Done |
| File reorder | Done |
| Merge into single TXT | Done |
| Export as EPUB | Done |

### Phase 4: EPUB Reader
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| EPUB parsing (ZIP + XML spine order) | Done |
| XHTML to DOCX conversion | Done |
| XHTML to Markdown conversion | Done |
| Batch conversion (max 10 files) | Done |
| EPUB to DOCX/TXT tab UI | Done |

### Phase 5: DOCX/TXT to EPUB
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| DOCX processing via mammoth | Done |
| TXT processing with encoding detection (GBK, Big5, Shift-JIS, etc.) | Done |
| Markdown auto-detection via marked | Done |
| Metadata form (title, author, translator, language) | Done |
| Cover image upload with crop/resize (5:8 ratio) | Done |
| Custom font embedding | Done |
| Chapter detection, filtering, reordering | Done |
| EPUB 3.0 generation with navigation | Done |
| Preview before export | Done |

### Phase 6: EPUB Modular Refactor
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| Extract monolithic epub-generator.ts into modular structure | Done |
| Separate modules: types, utils, templates, styles, chapter-builder, cover-handler | Done |
| Maintain backward compatibility | Done |

### Phase 7: Testing & Quality
**Status:** Done | **Progress:** 100%

| Feature | Status |
|---------|--------|
| Chapter parser tests (position-based, edge cases) | Done |
| EPUB template tests (OPF, NCX, TOC, cover) | Done |
| Chapter builder tests | Done |
| 34 tests passing | Done |
| ESLint: 0 errors, 0 warnings | Done |
| TypeScript strict mode: 0 errors | Done |
| Production build passing | Done |

## Potential Future Work

| Feature | Priority | Notes |
|---------|----------|-------|
| EPUB validation (epubcheck integration) | Low | Could use WASM epubcheck |
| PDF export | Low | Would require additional library |
| Drag-and-drop chapter reordering in tab 4 | Medium | Currently uses button controls |
| Character encoding selector in UI | Low | Currently auto-detect only |
| Theme support (dark mode) | Low | Tailwind dark: prefix |
| Batch DOCX/TXT to EPUB (multiple files) | Medium | lib support exists, UI missing |
| Table of contents customization | Low | Currently auto-generated |
| Image embedding in chapters | Low | Requires XHTML image handling |
