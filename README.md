# Convert_doc

A browser-based document conversion tool for e-books — 100% client-side processing, no server required.

Supports: TXT, DOCX, EPUB.

## Tech Stack

| Library | Purpose |
|---------|---------|
| Next.js 16 + React 19 | UI framework |
| TypeScript | Static typing |
| Tailwind CSS 4 | Styling |
| jszip | ZIP/EPUB creation |
| mammoth | DOCX reading |
| docx | DOCX writing |
| marked | Markdown parsing |
| file-saver | Browser download |
| vitest | Testing |

## Features (4 Tabs)

### 1. Convert & Split
Upload TXT/DOCX → detect chapters via regex → split into multiple files → download as ZIP.

### 2. Merge & EPUB
Upload TXT/DOCX → reorder → merge → export as TXT or EPUB.

### 3. EPUB to DOCX/TXT
Upload EPUB → convert to DOCX or Markdown → download.

### 4. DOCX/TXT to EPUB
Upload → enter metadata + cover image + font → detect/filter chapters → preview → export EPUB.

## Installation & Usage

```bash
npm install
npm run dev        # Development server
npm run build      # Production build (static export)
npm run lint       # ESLint
npx vitest run     # Run tests
```

Build output uses static export (`output: 'export'`) — no Node.js server needed.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page with 4 tabs
├── components/
│   ├── tab-convert-split/  # Tab 1: Convert & Split (5 steps)
│   ├── tab-merge-epub/     # Tab 2: Merge & EPUB (4 steps)
│   ├── tab-epub-to-doc/    # Tab 3: EPUB to DOCX/TXT (4 steps)
│   ├── tab-doc-to-epub/    # Tab 4: DOCX/TXT to EPUB (5 steps)
│   └── ui/                 # Shared UI components
└── lib/
    ├── chapter-parser.ts   # 24 preset patterns, line/position detection
    ├── docx-converter.ts   # DOCX <-> text conversion
    ├── file-processor.ts   # High-level file read/split/merge
    ├── zip-builder.ts      # ZIP create/extract via JSZip
    ├── epub/               # EPUB 3.0 generation engine (8 files)
    ├── epub-reader/        # EPUB parsing + converters (4 files)
    └── doc-to-epub/        # DOCX/TXT-to-EPUB orchestrator (3 files)
```

## Architecture

All processing happens in the browser:
- File upload via FileDropzone → FileReader/ArrayBuffer
- Text processing via mammoth (DOCX), TextDecoder (encoding), marked (Markdown)
- Chapter detection via regex patterns (24 presets for VN/CN/EN)
- EPUB generation via JSZip with hand-crafted XML templates
- Download via file-saver

No server upload. Files never leave the user's browser.

## Testing

4 test files, 34 tests with vitest:
- `chapter-parser.test.ts` — Position-based and line-based detection, edge cases
- `epub/chapter-builder.test.ts` — Chapter XHTML building
- `epub/cover.test.ts` — Cover template generation
- `epub/toc.test.ts` — OPF, NCX, TOC templates

## Documentation

See the `docs/` directory for more details:
- [Usage Guide](./docs/usage-guide.md)
- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Code Standards](./docs/code-standards.md)
- [System Architecture](./docs/system-architecture.md)
- [Project Roadmap](./docs/project-roadmap.md)
