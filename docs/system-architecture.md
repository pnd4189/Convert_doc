# System Architecture

**Last Updated:** 2026-04-25

## Overview

Convert_doc is a single-page application with 100% client-side processing. There is no backend server. All file conversion, chapter detection, and EPUB generation happen in the browser via JavaScript libraries.

## Architecture Diagram

```
Browser
┌─────────────────────────────────────────────────────┐
│  page.tsx                                           │
│  ┌─────────────────────────────────────────────┐    │
│  │  Tabs: Convert | Merge | EPUB->DOC | DOC->EPUB │ │
│  └──────┬──────────┬──────────┬──────────┬─────┘    │
│         │          │          │          │           │
│  ┌──────▼──┐ ┌─────▼───┐ ┌───▼──────┐ ┌─▼────────┐│
│  │Tab 1:   │ │Tab 2:   │ │Tab 3:    │ │Tab 4:    ││
│  │Convert  │ │Merge    │ │EPUB to   │ │DOCX/TXT  ││
│  │& Split  │ │& EPUB   │ │DOCX/TXT  │ │to EPUB   ││
│  │(5 steps)│ │(4 steps)│ │(4 steps)  │ │(5 steps) ││
│  └────┬────┘ └────┬────┘ └─────┬─────┘ └────┬─────┘│
│       │           │            │             │       │
│  ┌────▼───────────▼────────────▼─────────────▼────┐ │
│  │            Shared Library Layer                 │ │
│  │                                                │ │
│  │  chapter-parser    file-processor              │ │
│  │  docx-converter    zip-builder                 │ │
│  │  epub/             epub-reader/                │ │
│  │  doc-to-epub/                                  │ │
│  └────────────────┬───────────────────────────────┘ │
│                   │                                 │
│  ┌────────────────▼───────────────────────────────┐ │
│  │         External Libraries (npm)               │ │
│  │  jszip | mammoth | docx | marked | file-saver  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │
    No server connection
```

## Data Flow

### Tab 1: Convert & Split

```
File[] ──> FileDropzone
              │
              ▼
         FileReader / mammoth
              │
              ▼
         Combined text content
              │
              ▼
    chapter-parser.parseChapters()  ◄── 24 preset patterns / custom regex
              │
              ▼
         Chapter[] (detected)
              │
              ▼
    file-processor.splitByChapters(chapters, perFile)
              │
              ▼
         ZipFile[]
              │
              ▼
    zip-builder.createZip() ──> Blob ──> saveAs()
```

### Tab 2: Merge & EPUB

```
File[] ──> FileDropzone
              │
              ▼
    User reorders files
              │
              ▼
    file-processor.mergeFiles() ──> TXT output
              │
              ▼
    epub.generateEpubWithChapters() ──> EPUB output
              │
              ▼
         saveAs()
```

### Tab 3: EPUB to DOCX/TXT

```
EPUB File ──> JSZip.loadAsync()
                  │
                  ▼
         epub-parser.parseEpub()
         (container.xml -> content.opf -> spine -> XHTML)
                  │
                  ▼
         EpubContent { title, author, chapters[] }
                  │
            ┌─────┴─────┐
            ▼            ▼
    xhtml-to-docx   xhtml-to-markdown
    (docx lib)      (string processing)
            │            │
            ▼            ▼
    DOCX Blob      TXT Blob
            │            │
            └─────┬──────┘
                  ▼
             saveAs()
```

### Tab 4: DOCX/TXT to EPUB

```
File ──> FileDropzone
            │
            ▼
    doc-to-epub.processDocument()
    ├── docx-processor.processDocx()  (if .docx, via mammoth)
    └── txt-processor.processTxt()    (if .txt, encoding detect + marked)
            │
            ▼
    HTML + plain text
            │
            ▼
    chapter-parser.detectChaptersByPosition()
            │
            ▼
    Chapter[] ──> User filters/reorders
                      │
                      ▼
    Cover image ──> cover-handler.processCoverImage()
                   (center-crop, resize 1600x2560)
                      │
                      ▼
    epub.generateEpubWithChapters(metadata, chapters, {fontFile})
    ├── templates: container.xml, content.opf, toc.ncx, toc.xhtml
    ├── chapter-builder: per-chapter XHTML
    ├── styles: default CSS or CJK CSS with @font-face
    └── JSZip: assemble all into EPUB Blob
                      │
                      ▼
                 saveAs()
```

## Module Interaction Map

```
chapter-parser (standalone)
    Used by: epub/index.ts, doc-to-epub/index.ts, tab-convert-split/step-detect-chapters.tsx

docx-converter (standalone)
    Used by: file-processor.ts

file-processor (standalone)
    Used by: tab-convert-split, tab-merge-epub

zip-builder (standalone)
    Used by: tab-convert-split, file-processor

epub/ (modular engine)
    ├── types.ts      ◄── shared interfaces
    ├── utils.ts      ◄── uuid, escapeXml, textToHtml
    ├── templates.ts  ◄── XML generators
    ├── styles.ts     ◄── CSS generators
    ├── chapter-builder.ts ◄── XHTML builder
    ├── cover-handler.ts   ◄── image processor
    └── index.ts      ──► generateEpubWithChapters()
    Used by: tab-merge-epub, doc-to-epub, tab-doc-to-epub

epub-reader/ (parsing engine)
    ├── epub-parser.ts      ◄── ZIP + XML parsing
    ├── xhtml-to-docx.ts    ◄── DOCX element builder
    ├── xhtml-to-markdown.ts ◄── Markdown converter
    └── index.ts            ──► convertEpubToDocx(), convertEpubToMarkdown()
    Used by: tab-epub-to-doc

doc-to-epub/ (orchestrator)
    ├── docx-processor.ts ◄── mammoth wrapper
    ├── txt-processor.ts  ◄── encoding + markdown detection
    └── index.ts          ──► convertDocToEpub(), batchConvertDocsToEpub()
    Used by: tab-doc-to-epub
    Depends on: epub/, chapter-parser
```

## EPUB 3.0 File Structure (Generated Output)

```
output.epub
├── mimetype                    # "application/epub+zip" (uncompressed)
├── META-INF/
│   └── container.xml           # Points to OEBPS/content.opf
└── OEBPS/
    ├── content.opf             # Package doc: manifest, spine, metadata
    ├── toc.ncx                 # NCX navigation (EPUB 2 compat)
    ├── toc.xhtml               # HTML nav (EPUB 3)
    ├── style.css               # Default or CJK CSS
    ├── cover.xhtml             # Cover page (if cover provided)
    ├── images/
    │   └── cover.jpg           # Processed cover (5:8, JPEG)
    ├── fonts/
    │   └── {fontfile}          # Embedded font (if provided)
    └── chapters/
        ├── chapter-001.xhtml   # Chapter 1
        ├── chapter-002.xhtml   # Chapter 2
        └── ...
```

## Encoding Detection Strategy

The `txt-processor` uses a multi-encoding fallback chain:

1. Try UTF-8 with `fatal: true`
2. If fails, try GBK (Simplified Chinese)
3. Try GB2312 (Chinese)
4. Try Big5 (Traditional Chinese)
5. Try Shift-JIS (Japanese)
6. Try EUC-JP (Japanese)
7. Try EUC-KR (Korean)
8. Fallback: UTF-8 with replacement characters

## Chapter Detection Strategy

Two detection modes serve different purposes:

### Line-based (`parseChapters`)
- Used in: Convert & Split tab
- Splits text into lines, matches each line against regex
- Returns chapters with `startLine` / `endLine` (1-indexed)
- Supports custom regex input from user

### Position-based (`detectChaptersByPosition`)
- Used in: DOCX/TXT to EPUB tab
- Matches regex against full content string using `exec()` positions
- Returns chapters with `startPosition` (char offset)
- Preserves pre-chapter content as "Loi mo dau" (preface, index 0)

Both modes share the same 24 preset patterns covering:
- Vietnamese: Chuong, Hoi, Phan, Muc, Quyển-Chuong + numbers/words/Roman
- Chinese: 第X章, 第X回, 第X节, 卷X + Arabic/Chinese numerals
- English: Chapter, Part, Book, Volume, Section, Episode
