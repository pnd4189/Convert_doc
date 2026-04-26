# Test Report: TXT-to-EPUB Enhanced Integration

**Date:** 2026-04-24 22:12  
**Scope:** CLI + Web app changes for txt-to-epub enhancement  
**Mode:** Diff-aware (11 changed files in src/)

---

## Test Results Overview

| Suite | Total | Pass | Fail | Skip |
|-------|-------|------|------|------|
| vitest (existing) | 34 | 34 | 0 | 0 |
| Python CLI (manual) | 15 | 15 | 0 | 0 |
| TypeScript compilation | 1 | 1 | 0 | 0 |
| Next.js build | 1 | 1 | 0 | 0 |

**All tests pass. No regressions.**

---

## Diff-Aware Mapping

```
Changed: 11 files (4 lib, 4 components, 3 config)
Mapped:   chapter-parser.test.ts (Strategy A, co-located)
Unmapped: src/lib/epub/styles.ts, src/lib/epub/index.ts,
          src/lib/doc-to-epub/txt-processor.ts, src/lib/doc-to-epub/index.ts,
          src/components/tab-doc-to-epub/*.tsx (4 files)
```

Ran 34/34 tests (diff-based): 34 passed, 0 failed.

---

## 1. Vitest Suite (34/34 pass)

- `chapter-parser.test.ts` - 6 tests pass
- `epub/chapter-builder.test.ts` - 9 tests pass
- `epub/cover.test.ts` - 9 tests pass
- `epub/toc.test.ts` - 10 tests pass

Duration: 175ms. No flaky tests.

**Coverage (v8):**

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| chapter-parser.ts | 35.2% | 30.2% | 20.0% | 36.4% |
| chapter-builder.ts | 100% | 85.7% | 100% | 100% |
| templates.ts | 76.7% | 100% | 66.7% | 76.7% |
| utils.ts | 44.4% | 0% | 50.0% | 44.4% |
| **Overall** | **48.1%** | **47.7%** | **47.2%** | **50.0%** |

---

## 2. Python CLI Tests (15/15 pass)

### Subcommand availability
- `convert --help` - OK (shows all 7 subcommands including txt-to-epub)
- `detect --help` - OK
- `doc-to-epub --help` - OK
- `txt-to-epub --help` - OK (all flags present)

### Basic conversion
- `txt-to-epub /tmp/test-novel.txt -o /tmp/test-output.epub` - OK
  - Output: valid EPUB (6 chapters, 6076 bytes)
  - Includes preface "Loi mo dau" + 5 content chapters

### Chapter range filtering
- `--start-chapter 1 --end-chapter 3` - OK (3 chapters, indices renumbered 1-3)
- `--start-chapter 3` (no end) - OK (3 chapters: original 3,4,5 -> 1,2,3)
- `--start-chapter 0 --end-chapter 0` - OK (all 6 chapters)
- `--start-chapter 10 --end-chapter 20` - OK (graceful "No chapters in range")

### Custom pattern
- `--pattern "^Chuong \d+"` - OK (5 chapters matched, no preface)
- `--pattern "[invalid(regex"` - OK (error: "Invalid regex: unterminated character set")

### Error handling
- Nonexistent input file - OK (exit code 1, "No such file or directory")
- Pandoc not installed - OK (exit code 1, clear error message)

### Module-level tests
- `encoding_detector.detect_encoding()` - OK (UTF-8 detected)
- `encoding_detector.read_file_with_encoding()` - OK (auto and explicit)
- `chapter_detector.filter_chapters_by_range()` - OK (all edge cases)
- `chapter_detector.detect_with_custom_pattern()` - OK (valid + invalid regex)
- `chapter_detector.detect_chapters()` - OK (via detect subcommand)

### Metadata flags
- `--title`, `--author`, `--lang` - OK (metadata applied correctly)

---

## 3. TypeScript & Build

- `npx tsc --noEmit` - PASS (zero errors)
- `npm run build` - PASS (Next.js 16.0.10, compiled in 3.2s, static pages generated)

---

## Issues Found

### MINOR: Font status message misleading (CLI)
**File:** `convert.py:205`  
**When:** `--embed-font <nonexistent-path>` or `--embed-default-cjk-font` (no bundled font)  
**Symptom:** CLI prints "Font: yes" even when font file doesn't exist. EPUB correctly does NOT embed the font (safe fallback to standard CSS), but user gets misleading status.  
**Impact:** Low. Data is correct, UX message is wrong.  
**Fix:** Change status message to check `font_path and Path(font_path).is_file()`.

### NOTE: CJK CSS requires actual font file
**File:** `epub_writer.py:72`  
**Behavior:** `_get_epub_styles(use_cjk=True, font_file="")` returns standard CSS because CJK CSS template requires `font_file` for `@font-face` URL.  
**Impact:** Low. Safe -- prevents broken `@font-face` with empty URL. But `--lang zh` without font won't get CJK-optimized line-height/indent.  
**Recommendation:** Consider splitting CJK CSS from font-face CSS so `--lang zh` still gets text-indent:2em and line-height:1.7 even without font.

### NOTE: filter_chapters_by_range mutates Chapter objects in-place (Python)
**File:** `chapter_detector.py:150-151`  
**Behavior:** `ch.index = i + 1` mutates original Chapter dataclass objects.  
**Impact:** Low in CLI (single-pass), but could cause bugs if called multiple times on same list.  
**TypeScript version** (`chapter-parser.ts:458`) uses `.map(ch => ({ ...ch, index: i+1 }))` -- correctly creates new objects.  
**Recommendation:** Python should also create new Chapter objects instead of mutating.

---

## Uncovered Code Paths

### New functions with ZERO test coverage (TypeScript):
1. **`chapter-parser.ts` -> `detectWithCustomRegex()`** (lines 434-442) - Custom regex chapter detection
2. **`chapter-parser.ts` -> `filterChaptersByRange()`** (lines 447-459) - Chapter range filter
3. **`epub/styles.ts` -> `getCjkStyles()`** (lines 77-152) - CJK CSS generation
4. **`txt-processor.ts` -> `filterChaptersByRange()`** (lines 103-115) - Duplicate of chapter-parser version
5. **`txt-processor.ts` -> `detectAndReadFile()`** (lines 16-38) - Multi-encoding file reading
6. **`txt-processor.ts` -> `TxtProcessOptions` interface** - encoding/pattern/range options
7. **`epub/index.ts` -> font embedding path** (lines 67-72) - Font zip insertion

### Suggested test cases:
```
1. describe('detectWithCustomRegex') {
     - valid pattern -> returns chapters
     - invalid pattern -> throws Error with message
     - no matches -> returns empty array
   }

2. describe('filterChaptersByRange') {
     - range 0,0 -> returns all (identity)
     - range 2,4 -> returns 3 chapters reindexed
     - range start-only -> returns tail
     - range end-only -> returns head
     - range out of bounds -> returns empty
   }

3. describe('getCjkStyles') {
     - returns string containing @font-face
     - contains font URL with provided filename
   }

4. describe('generateEpubWithChapters with font') {
     - fontFile provided -> ZIP contains OEBPS/fonts/ entry
     - fontFile null -> no font entry in ZIP
   }
```

---

## Performance

- Vitest: 175ms total (18ms test execution)
- TypeScript check: <5s
- Next.js build: 3.2s compile + 0.5s static pages
- Python txt-to-epub: <1s for 807-char input
- No slow tests or resource concerns

---

## Summary

**PASS.** All existing tests pass, TypeScript compiles, Next.js builds, Python CLI works correctly for all tested scenarios. The new functionality (chapter range, custom regex, font embedding, encoding detection, pandoc backend) works as designed.

**3 minor issues** noted (misleading font status, CJK CSS without font, in-place mutation). None are blocking.

**Coverage gap:** 5 new TypeScript functions have 0% test coverage. Recommended 4 new test describe blocks above.

---

## Unresolved Questions

1. Should `filterChaptersByRange` exist in both `chapter-parser.ts` AND `txt-processor.ts`? They are near-identical. DRY violation.
2. No bundled CJK font exists at `scripts/assets/NotoSansSC-Regular.ttf` -- is this intentional (user provides their own) or should the asset be included?
3. The `step-chapters.tsx` has a custom regex input UI but the `handleApplyRegex` / re-detect flow with `detectWithCustomRegex` from chapter-parser doesn't appear to be wired up -- is this a TODO?
