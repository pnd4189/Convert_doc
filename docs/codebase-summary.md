# Codebase Summary

**Last Updated:** 2026-04-25

## File Structure

```
Convert_doc/
├── next.config.ts              # Static export config
├── tsconfig.json               # TypeScript config (strict, @/* alias)
├── package.json                # Dependencies and scripts
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, Geist fonts, lang="vi"
│   │   ├── page.tsx            # Main page - 4 tabs
│   │   ├── globals.css         # Tailwind imports
│   │   └── favicon.ico
│   ├── components/
│   │   ├── tab-convert-split/  # Feature tab 1
│   │   ├── tab-merge-epub/     # Feature tab 2
│   │   ├── tab-epub-to-doc/    # Feature tab 3
│   │   ├── tab-doc-to-epub/    # Feature tab 4
│   │   └── ui/                 # Shared components
│   └── lib/                    # Core business logic
│       ├── chapter-parser.ts
│       ├── docx-converter.ts
│       ├── file-processor.ts
│       ├── zip-builder.ts
│       ├── epub/
│       ├── epub-reader/
│       └── doc-to-epub/
└── docs/                       # Documentation
```

## Module Map

### Core Libraries (`src/lib/`)

| Module | LOC | Purpose |
|--------|-----|---------|
| `chapter-parser.ts` | 459 | Chapter detection: 24 preset regex (VN/CN/EN), line-based + position-based parsing, auto-detect, custom regex, range filtering |
| `epub/templates.ts` | 261 | XML/HTML template generators: container.xml, content.opf, toc.ncx, toc.xhtml, cover.xhtml |
| `epub-reader/xhtml-to-docx.ts` | 249 | XHTML -> DOCX element conversion via docx library |
| `epub-reader/xhtml-to-markdown.ts` | 191 | XHTML -> Markdown text conversion |
| `epub/styles.ts` | 156 | Default and CJK-optimized CSS for EPUB |
| `epub-reader/index.ts` | 149 | EPUB reader orchestrator: parse, convert to DOCX/TXT, batch support |
| `doc-to-epub/index.ts` | 137 | DOCX/TXT -> EPUB orchestrator: single, batch, separate conversions |
| `epub/cover-handler.ts` | 99 | Cover image processing: center-crop, resize to 1600x2560px |
| `docx-converter.ts` | 95 | DOCX <-> text: mammoth for reading, docx lib for writing |
| `epub/index.ts` | 102 | EPUB generator: JSZip-based EPUB 3.0 creation |
| `epub-reader/epub-parser.ts` | 126 | EPUB extraction: ZIP parse, OPF spine order, metadata |
| `file-processor.ts` | 117 | High-level: read files, split by chapters, merge, format size |
| `doc-to-epub/txt-processor.ts` | 128 | TXT processing: encoding detection, Markdown auto-detect, HTML conversion |
| `zip-builder.ts` | 76 | ZIP create/extract via JSZip with progress |
| `doc-to-epub/docx-processor.ts` | 54 | DOCX -> HTML via mammoth |
| `epub/chapter-builder.ts` | 60 | Build individual chapter XHTML files |
| `epub/utils.ts` | 35 | UUID generation, XML escape, text-to-HTML |
| `epub/types.ts` | 33 | Interfaces: EpubMetadata, EpubChapter, CoverConfig |

**Total lib LOC:** ~2,936

### Components (`src/components/`)

| Component | LOC | Purpose |
|-----------|-----|---------|
| `tab-merge-epub/step-export.tsx` | 314 | Merge export with format selection (TXT/EPUB) |
| `tab-doc-to-epub/step-chapters.tsx` | 262 | Chapter detection, filtering, reordering UI |
| `tab-convert-split/step-detect-chapters.tsx` | 182 | Pattern selection, custom regex, chapter preview |
| `tab-doc-to-epub/step-metadata.tsx` | 167 | Metadata form, cover upload, font upload |
| `tab-doc-to-epub/index.tsx` | 142 | 5-step wizard container |
| `tab-merge-epub/step-reorder.tsx` | 138 | Drag-to-reorder file list |
| `tab-doc-to-epub/step-export.tsx` | 135 | EPUB generation and download |
| `tab-convert-split/index.tsx` | 130 | 5-step wizard container |
| `tab-convert-split/step-convert.tsx` | 131 | File conversion step |
| `ui/file-dropzone.tsx` | 124 | File upload drag-and-drop component |
| `tab-merge-epub/index.tsx` | 105 | 4-step wizard container |
| `tab-convert-split/step-split-config.tsx` | 101 | Split configuration |
| `tab-epub-to-doc/index.tsx` | 95 | 4-step wizard container |
| `tab-doc-to-epub/step-preview.tsx` | 76 | EPUB preview before export |
| `ui/stepper.tsx` | 69 | Step wizard navigation |
| `tab-epub-to-doc/step-configure.tsx` | 79 | Output format selection |
| `tab-epub-to-doc/step-convert.tsx` | 82 | Conversion progress |
| `tab-merge-epub/step-preview.tsx` | 71 | Merge preview |
| `tab-merge-epub/step-upload.tsx` | 71 | File upload |
| `tab-epub-to-doc/step-download.tsx` | 69 | Download results |
| `tab-convert-split/step-download.tsx` | 88 | Download ZIP |
| `ui/select.tsx` | 56 | Select dropdown |
| `ui/button.tsx` | 54 | Button component |
| `ui/tabs.tsx` | 53 | Tab navigation |
| `tab-*-to-*/step-upload.tsx` | 44-48 | Upload steps (3 variants) |
| `ui/input.tsx` | 38 | Input component |
| `ui/progress.tsx` | 37 | Progress bar |

**Total component LOC:** ~3,009

### Tests (`src/lib/*.test.ts`)

| Test File | LOC | Coverage |
|-----------|-----|----------|
| `chapter-parser.test.ts` | 77 | Position-based detection, preface handling, fallback |
| `epub/chapter-builder.test.ts` | 83 | Chapter XHTML building, metadata embedding |
| `epub/cover.test.ts` | 106 | Cover template generation |
| `epub/toc.test.ts` | 143 | OPF, NCX, TOC XHTML template generation |

**Total test LOC:** ~409, 34 tests

### App Shell (`src/app/`)

| File | LOC | Purpose |
|------|-----|---------|
| `page.tsx` | 62 | Main page: header + 4 tab panels + footer |
| `layout.tsx` | 34 | Root layout: Geist fonts, Vietnamese lang |

## Dependency Graph

```
page.tsx
├── tab-convert-split/index.tsx
│   ├── ui/stepper, ui/file-dropzone
│   ├── lib/chapter-parser
│   ├── lib/file-processor
│   │   ├── lib/docx-converter (mammoth, docx)
│   │   └── lib/zip-builder (jszip)
│   └── lib/zip-builder
├── tab-merge-epub/index.tsx
│   ├── ui/stepper, ui/file-dropzone
│   ├── lib/file-processor
│   └── lib/epub (jszip)
├── tab-epub-to-doc/index.tsx
│   ├── ui/stepper, ui/file-dropzone
│   └── lib/epub-reader
│       ├── lib/epub-reader/epub-parser (jszip)
│       ├── lib/epub-reader/xhtml-to-docx (docx)
│       └── lib/epub-reader/xhtml-to-markdown
└── tab-doc-to-epub/index.tsx
    ├── ui/stepper, ui/file-dropzone
    └── lib/doc-to-epub
        ├── lib/doc-to-epub/docx-processor (mammoth)
        ├── lib/doc-to-epub/txt-processor (marked)
        └── lib/epub
            ├── lib/epub/chapter-builder
            ├── lib/epub/cover-handler
            ├── lib/epub/templates
            ├── lib/epub/styles
            └── lib/chapter-parser
```

## Key Exports

### `lib/chapter-parser`
- `PRESET_PATTERNS` — 24 preset regex patterns
- `parseChapters()` — Line-based chapter parsing
- `detectChaptersByPosition()` — Position-based detection (for EPUB)
- `autoDetectPattern()` — Find best-matching pattern
- `detectWithCustomRegex()` — User-provided regex
- `filterChaptersByRange()` — Range-based chapter filtering

### `lib/epub`
- `generateEpubWithChapters()` — Generate multi-chapter EPUB 3.0
- `processCoverImage()` — Crop/resize cover to 5:8 ratio
- `buildChapterXhtml()` — Build individual chapter XHTML

### `lib/epub-reader`
- `convertEpubToDocx()` — EPUB -> DOCX conversion
- `convertEpubToMarkdown()` — EPUB -> Markdown/TXT conversion
- `batchConvertEpub()` — Batch conversion (max 10 files)
- `isValidEpub()` — Quick EPUB validation

### `lib/doc-to-epub`
- `convertDocToEpub()` — Single DOCX/TXT -> EPUB
- `batchConvertDocsToEpub()` — Multiple docs -> single EPUB
- `batchConvertDocsToSeparateEpubs()` — Multiple docs -> separate EPUBs
- `processDocument()` — Process and detect chapters

### `lib/docx-converter`
- `docxToText()` — Read DOCX via mammoth
- `textToDocx()` — Write DOCX via docx lib
- `readFileContent()` — Auto-detect and read TXT/DOCX

### `lib/file-processor`
- `processFiles()` — Read multiple files with progress
- `splitByChapters()` — Split content into chapter groups
- `mergeFiles()` — Combine multiple file contents

### `lib/zip-builder`
- `createZip()` — Create ZIP from file array
- `extractZip()` — Extract ZIP to file array
