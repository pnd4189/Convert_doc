# File Converter & Chapter Splitter - Implementation Plan

**Created:** 2025-12-17
**Status:** Ready for Implementation
**Reference:** [Brainstorm Report](../reports/brainstorm-2025-12-17-file-converter-app.md)

---

## Overview

Web app xử lý file truyện với:
- Convert TXT ↔ DOCX (batch 10 files, >25MB)
- Đếm/tách chương, export ZIP
- Gộp nhiều file thành 1
- Convert sang EPUB

**Architecture:** Full client-side processing với Web Workers

---

## Tech Stack

| Package | Version |
|---------|---------|
| next | 16.0.10 |
| react | 19.2.3 |
| tailwindcss | 4.1.18 |
| mammoth | 1.11.0 |
| docx | 9.5.1 |
| jszip | 3.10.1 |
| epub-gen-memory | 1.1.2 |
| file-saver | 2.0.5 |

---

## Implementation Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | [Project Setup](./phase-01-project-setup.md) | Pending | 0% |
| 02 | [Core Libraries](./phase-02-core-libraries.md) | Pending | 0% |
| 03 | [Shared UI Components](./phase-03-shared-ui-components.md) | Pending | 0% |
| 04 | [Tab 1: Convert & Split](./phase-04-tab-convert-split.md) | Pending | 0% |
| 05 | [Tab 2: Merge & EPUB](./phase-05-tab-merge-epub.md) | Pending | 0% |
| 06 | [Web Workers Integration](./phase-06-web-workers.md) | Pending | 0% |
| 07 | [Testing & Deploy](./phase-07-testing-deploy.md) | Pending | 0% |

---

## Key Dependencies

```
Phase 01 → Phase 02 → Phase 03 → Phase 04 ──┐
                                 ↓          ↓
                           Phase 05 ← ──────┘
                                 ↓
                           Phase 06 → Phase 07
```

---

## Estimated File Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── tab-convert-split/
│   └── tab-merge-epub/
├── lib/
│   ├── file-processor.ts
│   ├── chapter-parser.ts
│   ├── docx-converter.ts
│   ├── epub-generator.ts
│   └── zip-builder.ts
└── workers/
    └── file-worker.ts
```

---

## Unresolved Questions

None - All requirements confirmed in brainstorm phase.
