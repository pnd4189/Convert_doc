# Brainstorm: Convert_doc → Claude Code Skill

**Date:** 2026-04-24
**Status:** Approved → Ready for /ck:plan

---

## Problem Statement

Convert_doc là web app (Next.js static) chuyển đổi file TXT/DOCX/EPUB. Cần:
1. Review + optimize code hiện tại
2. Chuyển core logic thành Python CLI skill (`ck:convert-doc`) cho Claude Code
3. Giữ cả web app lẫn CLI skill

## Code Review Findings

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | Duplicate chapter detection (`chapter-parser.ts` vs `epub/chapter-detector.ts`) | Maintainability | Unify vào 1 module, dùng chung interface |
| 2 | Dead code: `jest.config.js`, `generateEpub()`, `EpubOptions`, `DocToEpubOptions` | Bloat | Xóa |
| 3 | EPUB version inconsistency (2.0 vs 3.0) | Compatibility | Unified EPUB 3.0 |
| 4 | No React error boundaries | UX | Thêm error boundary |
| 5 | Web-only APIs (DOMParser, FileReader, canvas) in core logic | Portability | Accept (web app only) |

## Chosen Approach

### Architecture: Single CLI + Python Modules

```
~/.claude/skills/convert-doc/
├── SKILL.md                    # Skill manifest
├── scripts/
│   ├── convert.py              # Main CLI (argparse subcommands)
│   ├── chapter_detector.py     # Chapter regex VN/CN/EN
│   ├── docx_handler.py         # python-docx read/write
│   ├── epub_writer.py          # ebooklib EPUB generation
│   ├── epub_reader.py          # EPUB parsing → DOCX/Markdown
│   ├── txt_processor.py        # TXT/Markdown processing
│   └── cover_handler.py        # Pillow cover crop/resize
```

### Subcommands & Flags

```
convert.py convert <input> --to <docx|txt|epub|md> [-o DIR]
convert.py split <input> --chapters-per-file N [-o DIR]
convert.py merge <files...> -o <output>
convert.py epub-to-doc <input> --format <docx|txt> [-o DIR]
convert.py doc-to-epub <input> --title TITLE [--author A] [--translator T] [--cover IMG] [--lang vi|en|zh]
convert.py detect <input> [--pattern auto|chuong|hoi|chapter|...]
```

### SKILL.md argument-hint

```
"[input-files] [--to docx|txt|epub|md] [--split N] [--merge] [--detect] [--title TITLE] [--author AUTHOR] [--cover IMAGE]"
```

### Python Dependencies (installed in .venv)

| Package | Purpose |
|---------|---------|
| python-docx | DOCX read/write |
| ebooklib | EPUB read/write |
| Pillow | Cover image processing |
| markdown | TXT → HTML for EPUB |
| beautifulsoup4 | XHTML parsing (EPUB reader) |

### Chapter Detection Port

Direct port from TypeScript `chapter-parser.ts` → Python `chapter_detector.py`:
- All preset patterns (VN: Chương/Hồi/Quyển/Phần/Mục, CN: 第X章/第X回/卷X, EN: Chapter/Part/Book/Volume)
- Vietnamese number words, Chinese numerals, Roman numerals
- Auto-detect best pattern
- Text normalization (BOM, line endings, zero-width chars)

## Implementation Plan (2 Phases)

### Phase 1: Optimize Web App
1. Unify chapter detection → single `chapter-parser.ts` with shared `Chapter` interface
2. Remove dead code (`jest.config.js`, `generateEpub()`, legacy interfaces)
3. Consistent EPUB 3.0 (remove EPUB 2.0 path)
4. Add React error boundary
5. Run tests to verify no regressions

### Phase 2: Create Python Skill
1. Create skill directory structure
2. Implement `chapter_detector.py` (port from TS)
3. Implement `docx_handler.py` (python-docx)
4. Implement `epub_writer.py` (ebooklib)
5. Implement `epub_reader.py` (ebooklib + beautifulsoup4)
6. Implement `txt_processor.py` (markdown lib)
7. Implement `cover_handler.py` (Pillow)
8. Implement `convert.py` main CLI (argparse)
9. Write `SKILL.md`
10. Install dependencies in .venv
11. Test all subcommands

## Risks

| Risk | Mitigation |
|------|-----------|
| ebooklib EPUB generation khác web app output | Test output với EPUB validators |
| Chapter detection regex port sai | Direct port + unit tests cho từng pattern |
| Cover crop khác browser canvas output | Pillow has equivalent center-crop, test output dimensions |
| Missing Pillow/python-docx in .venv | Install script trong setup |

## Success Criteria

- [ ] Web app: unified chapter detection, no dead code, EPUB 3.0 only
- [ ] Web app: all existing tests pass
- [ ] Skill: `ck:convert-doc detect input.txt` works
- [ ] Skill: `ck:convert-doc convert input.txt --to docx` works
- [ ] Skill: `ck:convert-doc split input.txt --chapters-per-file 10` works
- [ ] Skill: `ck:convert-doc merge f1.txt f2.txt -o merged.txt` works
- [ ] Skill: `ck:convert-doc epub-to-doc book.epub --format docx` works
- [ ] Skill: `ck:convert-doc doc-to-epub input.docx --title "Title"` works

## Resolved Questions

1. **Batch support**: YES - thêm `--batch` flag cho convert nhiều files
2. **Cover ratio**: Fixed 5:8 (1600x2560) - không customize
3. **Markdown library**: Dùng `markdown` (phổ biến, ổn định)

---

**Next Step:** Run `/ck:plan` để tạo detailed implementation plan.
