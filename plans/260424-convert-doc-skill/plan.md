---
name: 260424-convert-doc-skill
status: complete
created: 2026-04-24
completed: 2026-04-24
brainstorm: ../reports/brainstorm-260424-convert-doc-skill.md
---

# Convert_doc → Claude Code Skill

## Overview

Convert Convert_doc web app's core logic into a Python CLI skill (`ck:convert-doc`) for Claude Code. Optimize web app first, then create Python skill.

## Phases

| Phase | Name | Status | File |
|-------|------|--------|------|
| 1 | Optimize Web App | complete | [phase-01-optimize-web-app.md](phase-01-optimize-web-app.md) |
| 2 | Python Chapter Detector | complete | [phase-02-python-chapter-detector.md](phase-02-python-chapter-detector.md) |
| 3 | Python DOCX/TXT Handlers | complete | [phase-03-python-docx-txt-handlers.md](phase-03-python-docx-txt-handlers.md) |
| 4 | Python EPUB Writer | complete | [phase-04-python-epub-writer.md](phase-04-python-epub-writer.md) |
| 5 | Python EPUB Reader | complete | [phase-05-python-epub-reader.md](phase-05-python-epub-reader.md) |
| 6 | Python Cover Handler + Main CLI | complete | [phase-06-python-cover-handler-and-cli.md](phase-06-python-cover-handler-and-cli.md) |
| 7 | SKILL.md + Integration | complete | [phase-07-skill-md-and-integration.md](phase-07-skill-md-and-integration.md) |

## Key Dependencies

- All Python packages already in .venv: python-docx 1.2.0, EbookLib 0.20, Pillow 12.1.1, Markdown 3.10.2, beautifulsoup4 4.14.3, lxml 6.0.2
- Web app tests: 34 passing (Vitest, `src/lib/epub/*.test.ts`)

## Success Criteria

- [x] Web app: unified chapter detection, no dead code, EPUB 3.0 only, all tests pass
- [x] Skill: all 6 subcommands work (convert, split, merge, epub-to-doc, doc-to-epub, detect)
- [x] Skill: batch mode functional for convert/split/epub-to-doc/doc-to-epub
