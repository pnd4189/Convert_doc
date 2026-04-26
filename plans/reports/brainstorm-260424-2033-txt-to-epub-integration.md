# Brainstorm: TXT-to-EPUB Enhanced Integration

**Date:** 2026-04-24
**Status:** Approved → Planning

## Problem Statement

Integrate TXT-to-EPUB conversion features from `/home/dung/VIBE_CODING/TXT_to_Epub` into the Convert_doc project's skill CLI and web app. The current project already has basic TXT→EPUB but lacks: encoding auto-detection, chapter range filtering, custom regex patterns, CJK font embedding, and Pandoc backend option.

## Source Analysis

### TXT_to_Epub Unique Features
1. **Encoding detection** - cchardet for GBK/Big5/Shift-JIS etc.
2. **Chapter range extraction** - extract chapters N-M from large files
3. **Custom regex** - user-configurable chapter detection pattern
4. **CJK font embedding** - NotoSans SC embedded in EPUB
5. **Pandoc backend** - markdown→EPUB via pandoc subprocess

### Convert_doc Current State
- 4-tab Next.js web app (100% client-side)
- Python CLI skill with 6 subcommands (`convert`, `split`, `merge`, `epub-to-doc`, `doc-to-epub`, `detect`)
- 22 preset chapter patterns (VN/CN/EN) + auto-detect
- ebooklib (CLI) / JSZip (web) EPUB generation
- Cover image support with 5:8 center-crop
- Skill name: `ck:convert-doc` → rename to `convert-doc`

## Evaluated Approaches

### Approach 1: Enhanced ebooklib + Pandoc optional (CHOSEN)
- Enhance existing pipeline with all TXT_to_Epub features
- Pandoc as optional CLI-only backend (`--use-pandoc`)
- Web app uses enhanced JSZip pipeline (no Pandoc in browser)
- Minimal new code, maximum feature parity

### Approach 2: Modular plugin architecture (REJECTED)
- Pipeline abstraction with pluggable steps
- Over-engineering for this scope, YAGNI violation
- 10-15 new modules for marginal benefit

### Approach 3: Pandoc-only (REJECTED)
- Replace ebooklib entirely with Pandoc
- Loses web app capability (Pandoc = system dependency)
- Loses cover image support

## Final Design

### CLI: New `txt-to-epub` Subcommand

```
/convert-doc txt-to-epub input.txt [OPTIONS]
  --title TEXT          Book title (default: filename)
  --author TEXT         Author name
  --translator TEXT     Translator name
  --cover IMAGE         Cover image file
  --lang {vi,en,zh}     Language code (default: vi)
  --pattern REGEX       Custom chapter detection regex
  --pattern-id ID       Use preset pattern ID (1-22)
  --start-chapter N     Start chapter, 0=all (default: 0)
  --end-chapter M       End chapter, 0=all (default: 0)
  --encoding {auto,...} Input encoding (default: auto)
  --embed-font FILE     Embed custom font file
  --embed-default-cjk-font  Embed bundled NotoSans SC
  --use-pandoc          Use Pandoc backend (CLI only)
  -o, --output PATH     Output EPUB file path
```

### Pipeline Flow

```
input.txt
  → encoding_detector.py (cchardet → correct encoding read)
  → chapter_detector.py (22 presets OR custom --pattern)
  → txt_processor.py (range filter, HTML conversion)
  → epub_writer.py (default) OR pandoc_writer.py (--use-pandoc)
  → output.epub (with optional font embed + cover)
```

### Files to Create/Modify

**New Python modules:**
- `encoding_detector.py` (~40 lines) - cchardet encoding detection
- `pandoc_writer.py` (~80 lines) - Pandoc subprocess EPUB generation

**Enhanced Python modules:**
- `txt_processor.py` - Add chapter range filtering + custom regex support
- `epub_writer.py` - Add font embedding (CJK + custom)
- `convert.py` - Add `txt-to-epub` subcommand + rename skill

**Enhanced TypeScript modules:**
- `src/lib/doc-to-epub/txt-processor.ts` - Add range filter + custom regex
- `src/lib/epub/styles.ts` - Add CJK font-face CSS
- `src/lib/epub/chapter-builder.ts` - Add font manifest entries

**Enhanced React components:**
- Tab 4 step components - Add range inputs, regex input, font upload

**Bundled assets:**
- NotoSansSC-Regular.otf - Copy to skill directory for CLI embedding

### Dependencies
- Python: Add `cchardet` to venv
- Python: Optional system `pandoc`
- Web: No new npm packages (TextDecoder built-in)

## Success Criteria
1. `/convert-doc txt-to-epub input.txt --encoding auto` auto-detects encoding
2. `--start-chapter 5 --end-chapter 50` extracts chapter range
3. `--pattern "^Chapter \d+"` uses custom regex
4. `--embed-default-cjk-font` embeds NotoSans SC
5. `--use-pandoc` generates via Pandoc (CLI only)
6. Web app Tab 4 has range selector, regex input, font upload
7. Skill renamed from `ck:convert-doc` to `convert-doc`
8. All existing tests still pass

## Risks
- cchardet may not detect all encodings → fallback chain
- Pandoc not installed → graceful error message
- Font file size (~8MB) increases EPUB size → optional flag
- Web encoding detection less robust than cchardet → TextDecoder fallback chain

## Unresolved Questions
- None at this stage
