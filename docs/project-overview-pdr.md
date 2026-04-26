# Project Overview & Product Development Requirements

**Last Updated:** 2026-04-25

## Project Summary

Convert_doc is a browser-only document converter supporting DOCX/TXT/EPUB formats. All processing runs client-side -- no server uploads, no API calls, no data leaves the user's browser. Built for Vietnamese novel readers who need to convert, split, merge, and reformat text files.

## Goals

1. Provide a zero-install, zero-upload document conversion tool
2. Support Vietnamese, Chinese, and English novel chapter detection
3. Generate valid EPUB 3.0 files with cover images, custom fonts, and navigation
4. Allow bi-directional conversion between EPUB, DOCX, and TXT formats

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.0.10 |
| UI | React | 19.2.1 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.x |
| ZIP/EPUB | jszip | 3.10.1 |
| DOCX read | mammoth | 1.11.0 |
| DOCX write | docx | 9.5.1 |
| Markdown | marked | 17.0.1 |
| Download | file-saver | 2.0.5 |
| Testing | vitest | 4.0.16 |
| Build | Static export | `output: 'export'` |

## Features

### Tab 1: Convert & Split (`tab-convert-split`)

Upload TXT/DOCX files, detect chapters via 24 preset regex patterns (VN/CN/EN) or custom regex, split into multiple files with configurable chapters-per-file, download as ZIP.

**Flow:** Upload -> Convert to text -> Detect chapters -> Configure split -> Download ZIP

### Tab 2: Merge & EPUB (`tab-merge-epub`)

Upload multiple TXT/DOCX files, reorder them, merge into a single document, export as TXT or EPUB.

**Flow:** Upload -> Reorder -> Preview -> Export

### Tab 3: EPUB to DOCX/TXT (`tab-epub-to-doc`)

Upload EPUB files (max 10), parse content in spine order, convert XHTML to DOCX via `docx` library or to Markdown, download results.

**Flow:** Upload -> Select format -> Convert -> Download

### Tab 4: DOCX/TXT to EPUB (`tab-doc-to-epub`)

Upload DOCX/TXT, enter metadata (title, author, translator, language), add cover image and custom font, detect/filter/reorder chapters, preview, generate EPUB 3.0 with proper navigation.

**Flow:** Upload -> Metadata + cover + font -> Chapter detection/filter -> Preview -> Export EPUB

## Non-Functional Requirements

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Privacy | 100% client-side | No server uploads, all processing via FileReader/ArrayBuffer |
| Language | Vietnamese UI | All labels, errors, step titles in Vietnamese |
| Format support | TXT, DOCX, EPUB | Via mammoth, docx, jszip, marked |
| Encoding | UTF-8 + CJK fallback | Auto-detect GBK, Big5, Shift-JIS, EUC-JP/KR |
| EPUB compliance | EPUB 3.0 | Valid mimetype, container.xml, OPF, NCX, nav XHTML |
| Performance | Handle large novels | Chapter detection via position-based regex, no full DOM |
| Output | Static site | `next.config.ts: output: 'export'`, no Node.js server needed |

## Constraints

- Browser-only: no Node.js APIs in processing (only in build)
- Static export: no server-side rendering, no API routes
- No external dependencies at runtime (no CDN fonts, no API calls)
- Max 10 EPUB files for batch conversion (browser memory limit)
- Cover images processed via Canvas API (5:8 ratio, 1600x2560px target)

## Success Metrics

- All 4 tabs functional with end-to-end workflows
- TypeScript strict mode with zero build errors
- EPUB output passes basic EPUB 3.0 structure validation
- Vietnamese, Chinese, and English chapter detection working
- Unit tests covering core parsing and generation logic (34 tests)

## Out of Scope

- PDF support
- Audio/video embedding in EPUB
- Cloud storage integration
- User accounts or saved preferences
- Server-side processing of any kind
