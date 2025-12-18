# EPUB Conversion Tabs - Implementation Plan

**Date:** 2024-12-18
**Status:** Ready for Implementation
**Brainstorm:** [brainstorm-20251218-epub-conversion-tabs.md](../reports/brainstorm-20251218-epub-conversion-tabs.md)

---

## Overview

Add 2 new tabs to Convert_doc app:
1. **EPUB to DOCX/TXT** - Extract EPUB content, convert to DOCX or Markdown TXT
2. **DOCX/TXT to EPUB** - Convert documents to valid EPUB3 with chapter detection

## Architecture Summary

```
src/
├── lib/
│   ├── epub-reader/           # NEW: EPUB extraction & parsing
│   │   ├── index.ts           # Main orchestrator
│   │   ├── epub-parser.ts     # Parse container.xml, content.opf, spine
│   │   ├── xhtml-to-docx.ts   # XHTML → DOCX elements
│   │   └── xhtml-to-markdown.ts # XHTML → Markdown
│   ├── doc-to-epub/           # NEW: Document → EPUB wrapper
│   │   ├── index.ts           # Main orchestrator
│   │   ├── docx-processor.ts  # DOCX → HTML (mammoth wrapper)
│   │   └── txt-processor.ts   # TXT/Markdown → HTML (marked.js)
│   └── epub/                  # EXISTING: EPUB generation (reuse)
├── components/
│   ├── tab-epub-to-doc/       # NEW: Tab 1
│   └── tab-doc-to-epub/       # NEW: Tab 2
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| marked | ^15.0.0 | Markdown parsing for TXT input |
| @types/marked | ^6.0.0 | TypeScript types |

Existing deps: `jszip`, `mammoth`, `docx`, `file-saver`

## Phase Breakdown

| Phase | Description | Priority | Est. Effort | Status |
|-------|-------------|----------|-------------|--------|
| 1 | Setup epub-reader lib | P0 | Medium | DONE (2024-12-18) |
| 2 | EPUB to DOCX/TXT tab UI | P0 | Medium | DONE (2024-12-18) |
| 3 | Setup doc-to-epub lib | P1 | Low | DONE (2024-12-18) |
| 4 | DOCX/TXT to EPUB tab UI | P1 | Medium | DONE (2024-12-18) |
| 5 | Integration & testing | P1 | Low | DONE (2024-12-18) |

## Key Technical Decisions

1. **Browser-native DOMParser** - No cheerio, use browser DOM APIs
2. **Sequential batch processing** - Process files one-by-one to avoid memory issues
3. **Reuse existing epub/** - Leverage chapter-detector, templates, builder
4. **Markdown as TXT format** - Preserve structure via # headers, **bold**, etc.

## Success Metrics

- All text content preserved in conversions
- Valid EPUB3 output opens in e-readers
- Batch 10 files without browser crash
- Consistent UI with existing tabs

## File Dependencies Graph

```
epub-reader/
  └── index.ts
      ├── epub-parser.ts (parse EPUB structure)
      ├── xhtml-to-docx.ts (uses 'docx' lib)
      └── xhtml-to-markdown.ts (pure string transform)

doc-to-epub/
  └── index.ts
      ├── docx-processor.ts (uses 'mammoth')
      ├── txt-processor.ts (uses 'marked')
      └── ../epub/index.ts (reuse EPUB generation)
```

---

## Phase Files

- [phase-01-setup-epub-reader-lib.md](./phase-01-setup-epub-reader-lib.md)
- [phase-02-epub-to-docx-txt-tab.md](./phase-02-epub-to-docx-txt-tab.md)
- [phase-03-setup-doc-to-epub-lib.md](./phase-03-setup-doc-to-epub-lib.md)
- [phase-04-doc-to-epub-tab.md](./phase-04-doc-to-epub-tab.md)
- [phase-05-integration-and-testing.md](./phase-05-integration-and-testing.md)
