---
name: 260424-2033-txt-to-epub-enhanced-integration
status: complete
created: 2026-04-24
completed: 2026-04-25
brainstorm: ../reports/brainstorm-260424-2033-txt-to-epub-integration.md
---

# TXT-to-EPUB Enhanced Integration

## Overview

Integrate TXT_to_Epub features (encoding detection, chapter range, custom regex, CJK font embedding, Pandoc backend) into Convert_doc CLI skill and web app. Rename skill to `convert-doc`.

## Phases

| # | Phase | Status | File | Priority |
|---|-------|--------|------|----------|
| 1 | CLI: Encoding Detection & Chapter Filtering | complete | phase-01-cli-encoding-filtering.md | High |
| 2 | CLI: Font Embedding & Pandoc Backend | complete | phase-02-cli-font-pandoc.md | High |
| 3 | CLI: txt-to-epub Subcommand & Rename | complete | phase-03-cli-subcommand-rename.md | High |
| 4 | Web: Enhanced TXT Processing | complete | phase-04-web-txt-processing.md | Medium |
| 5 | Web: Font Embedding & UI Updates | complete | phase-05-web-font-ui.md | Medium |
| 6 | Testing & Verification | complete | phase-06-testing.md | High |

## Key Dependencies

- cchardet Python package (Phase 1)
- Pandoc system package (Phase 2, optional)
- NotoSansSC-Regular.otf font file (Phase 2)
- No new npm packages needed (Phase 4-5)

## Architecture Decision

Enhanced ebooklib pipeline (default) + Pandoc (optional CLI-only via `--use-pandoc`). Web app uses enhanced JSZip pipeline. Single codebase, dual EPUB generation backends.

## Constraints

- Must not break existing 6 subcommands
- Web app remains 100% client-side
- Font embedding is optional (flag-controlled)
- Pandoc requires system install, graceful fallback
