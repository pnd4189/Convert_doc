# Brainstorm: EPUB Conversion Tabs

**Date:** 2024-12-18
**Status:** Approved

---

## Problem Statement

Thêm 2 tab mới vào ứng dụng Convert_doc:
1. **Tab EPUB → DOCX/TXT**: Convert file EPUB sang DOCX hoặc TXT
2. **Tab DOCX/TXT → EPUB**: Convert DOCX hoặc TXT sang EPUB

**Yêu cầu chất lượng:** Không mất nội dung, preserve formatting tối đa.

---

## Requirements Confirmed

| Requirement | Decision |
|-------------|----------|
| DOC support | ❌ Không cần - user tự convert ngoài app |
| Input formats | DOCX, TXT, EPUB |
| Images | ❌ Không cần preserve |
| Formatting | ✅ Headings, bold/italic, lists, tables |
| TXT structure | Markdown format (preserve structure) |
| Batch processing | Max 10 files đồng thời |

---

## Existing Assets (Reusable)

Từ codebase hiện tại:
- `jszip` - Extract/create ZIP/EPUB
- `mammoth` - DOCX → HTML conversion
- `docx` - Create DOCX files
- `src/lib/epub/` - Full EPUB generation (chapter detection, templates, builder)
- `src/components/ui/` - Reusable UI components (stepper, file-dropzone, tabs)
- Tab patterns from `tab-convert-split` và `tab-merge-epub`

---

## Solution Design

### Tab 1: EPUB → DOCX/TXT

**New modules needed:**
```
src/lib/epub-reader/
├── index.ts              # Main entry - orchestrate extraction
├── epub-parser.ts        # Parse content.opf, get spine order
├── xhtml-to-docx.ts      # Convert XHTML → DOCX elements
└── xhtml-to-markdown.ts  # Convert XHTML → Markdown (for TXT)

src/components/tab-epub-to-doc/
├── index.tsx             # Tab container + stepper
├── step-upload.tsx       # Upload EPUB files (max 10)
├── step-configure.tsx    # Select output format (DOCX/TXT)
├── step-convert.tsx      # Processing + progress
└── step-download.tsx     # Download results
```

**Conversion flow:**
```
EPUB file(s)
  → jszip.loadAsync()
  → Parse META-INF/container.xml → find content.opf path
  → Parse content.opf → get spine reading order
  → Read XHTML files in order
  → DOMParser → traverse nodes
  → Build output:
      DOCX: docx library (Paragraph, TextRun, Table, etc.)
      TXT: Markdown string with headers (#), lists (- *), etc.
  → file-saver / zip if multiple files
```

**HTML → DOCX mapping:**
| HTML Element | DOCX Element |
|--------------|--------------|
| `<h1>-<h6>` | HeadingLevel.HEADING_1-6 |
| `<p>` | Paragraph |
| `<strong>/<b>` | TextRun({ bold: true }) |
| `<em>/<i>` | TextRun({ italics: true }) |
| `<ul>/<ol>` | Paragraph with bullet/numbering |
| `<table>` | Table, TableRow, TableCell |
| `<br>` | SoftBreak |

**HTML → Markdown mapping:**
| HTML Element | Markdown |
|--------------|----------|
| `<h1>-<h6>` | # to ###### |
| `<strong>` | **text** |
| `<em>` | *text* |
| `<ul><li>` | - item |
| `<ol><li>` | 1. item |
| `<table>` | \| col \| col \| format |
| `<a>` | [text](url) |

---

### Tab 2: DOCX/TXT → EPUB

**Reuse existing + new wrapper:**
```
src/lib/doc-to-epub/
├── index.ts              # Main orchestrator
├── docx-processor.ts     # DOCX → HTML (wrapper for mammoth)
└── txt-processor.ts      # TXT/Markdown → HTML

src/components/tab-doc-to-epub/
├── index.tsx             # Tab container + stepper
├── step-upload.tsx       # Upload DOCX/TXT files (max 10)
├── step-metadata.tsx     # Enter book title, author, etc.
├── step-chapters.tsx     # Review detected chapters, reorder
├── step-preview.tsx      # Preview EPUB structure
└── step-export.tsx       # Generate & download EPUB
```

**Conversion flow:**
```
DOCX/TXT file(s)
  → Detect file type
  → DOCX: mammoth.convertToHtml()
     TXT: marked.parse() or custom markdown parser
  → HTML content
  → existing chapter-detector.ts → detect chapters
  → existing epub/index.ts → generateEpubWithChapters()
  → Download .epub file(s)
```

**TXT parsing strategy:**
- Detect if content is Markdown (has # headers, **, etc.)
- If Markdown: parse with marked.js or similar
- If plain text: wrap in `<p>` tags, detect chapter patterns via regex

---

## Implementation Priority

1. **Phase 1: EPUB → DOCX/TXT** (less dependency on existing code)
   - Simpler: extract and convert
   - New modules, cleaner boundaries

2. **Phase 2: DOCX/TXT → EPUB** (leverage existing code)
   - Refactor existing epub/ modules if needed
   - More integration points

---

## Dependencies to Add

```json
{
  "dependencies": {
    "marked": "^15.0.0"  // Markdown parser (for TXT input)
  }
}
```

Note: `cheerio` không cần vì browser có `DOMParser` native.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex EPUB structures (nested TOC) | Medium | Start with flat chapter detection, iterate |
| Large files (>50MB EPUB) | Low | Add file size limit + chunked processing |
| EPUB 2 vs EPUB 3 differences | Medium | Support both, detect version from content.opf |
| Table formatting loss | Low | Acceptable - complex tables may simplify |
| Batch 10 files memory | Low | Process sequentially, not parallel in memory |

---

## Success Metrics

- [ ] EPUB → DOCX: All text content preserved
- [ ] EPUB → TXT: Structure visible via Markdown formatting
- [ ] DOCX → EPUB: Valid EPUB3 that opens in readers
- [ ] TXT → EPUB: Chapter detection works on standard patterns
- [ ] Batch: 10 files process without browser crash
- [ ] No content loss compared to source file

---

## UI/UX Considerations

- Consistent stepper pattern (match existing tabs)
- Progress indicator for batch processing
- Preview before download
- Clear error messages for unsupported content
- Drag & drop + click to upload (existing file-dropzone)

---

## File Structure After Implementation

```
src/
├── components/
│   ├── tab-epub-to-doc/          # NEW: Tab 1
│   ├── tab-doc-to-epub/          # NEW: Tab 2
│   ├── tab-convert-split/        # Existing
│   └── tab-merge-epub/           # Existing
├── lib/
│   ├── epub/                     # Existing - may need minor refactor
│   ├── epub-reader/              # NEW: EPUB extraction & parsing
│   └── doc-to-epub/              # NEW: DOCX/TXT → EPUB wrapper
```

---

## Next Steps

1. Create implementation plan với `/plan` command
2. Implement Tab 1 (EPUB → DOCX/TXT) first
3. Test với various EPUB samples
4. Implement Tab 2 (DOCX/TXT → EPUB)
5. Integration testing

---

## Unresolved Questions

None - all requirements clarified.
