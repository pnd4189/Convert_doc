# Code Review: bb3013b - unify chapter detection, add Python CLI skill

**Commit:** bb3013b on main
**Reviewer:** code-reviewer
**Date:** 2026-04-24

## Scope

- TypeScript: chapter-parser.ts (new +69 lines), epub/index.ts (-48 dead code), epub/types.ts (-15 dead types), doc-to-epub/index.ts (refactored imports), deleted chapter-detector.ts, jest.config.js, moved test
- Python CLI: 7 files at ~/.claude/skills/convert-doc/scripts/ + SKILL.md
- LOC: +1337 / -194
- Tests: 34/34 pass

## Critical Issues

### C1. `DocToEpubOptions` interface removed but still used (TypeScript)

**File:** `src/lib/doc-to-epub/index.ts:55`

The diff removes the `DocToEpubOptions` interface definition (lines 15-18 of old file) but `convertDocToEpub(options: DocToEpubOptions)` still references it on line 55. This is a type error that will fail `tsc --noEmit`. Vitest passes because it only runs test files (chapter-parser.test.ts, epub/*.test.ts) which don't import this symbol.

**Impact:** Any code importing `convertDocToEpub` will fail type checking. The function is used in the web app's doc-to-epub flow.

**Fix:** Add the interface back, or inline the type:
```typescript
export async function convertDocToEpub(options: { file: File; metadata: EpubMetadata }): Promise<Blob> {
```

### C2. `txt_processor.py` is dead code -- never imported or used

**File:** `~/.claude/skills/convert-doc/scripts/txt_processor.py` (52 lines)

No Python module imports `txt_processor`. The `convert.py` CLI never references it. The `epub_writer.py` has its own `_text_to_html()` that reimplements the same logic. The `is_markdown()` and `txt_to_html()` functions are orphaned.

**Impact:** Misleading -- suggests functionality exists but nothing wires to it. Future developers may assume Markdown-to-EPUB conversion is handled.

**Fix:** Either integrate `txt_processor` into `convert.py`'s `convert` subcommand (for txt-to-epub path) or delete it.

### C3. `chapter-parser.ts` exceeds 200-line limit (429 lines)

**File:** `src/lib/chapter-parser.ts`

The file merged chapter-detector.ts logic into chapter-parser.ts and now sits at 429 lines, more than double the 200-line project standard.

**Impact:** Per development-rules.md, files exceeding 200 lines should be modularized. The position-based detection (lines 365-429) is a distinct concern from the line-based parsing (lines 272-313).

**Fix:** Extract the position-based detection into a separate module, e.g., `chapter-position-detector.ts`.

## High Priority Issues

### H1. Unused `mime_map` variable in epub_writer.py

**File:** `epub_writer.py:178`

```python
ext = cover_path.suffix.lower()
mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
book.set_cover(f"cover{ext}", cover_data, create_page=True)
```

`mime_map` is defined but never used. The MIME type is not passed to `set_cover()`, so ebooklib will default the media type -- this may cause issues with some EPUB validators.

**Fix:** Either use it: `book.set_cover(f"cover{ext}", cover_data, create_page=True)` doesn't accept a mime_type param -- so remove the dead variable, or pass the correct mime type via a lower-level API if needed.

### H2. Unused imports in epub_writer.py

**File:** `epub_writer.py:9`

```python
from typing import Optional  # never used
```

And on line 7:
```python
from dataclasses import dataclass, field  # field is never used
```

**Fix:** Remove `Optional` and `field` from imports.

### H3. No error handling in CLI subcommands

**File:** `convert.py` -- all cmd_* functions

Every subcommand (cmd_convert, cmd_split, cmd_merge, cmd_epub_to_doc, cmd_doc_to_epub) has zero error handling. If any file is missing, corrupt, or an unsupported format edge case is hit, the user gets a raw Python traceback instead of a helpful message.

**Fix:** Wrap each cmd_* body in try/except with user-friendly error output:
```python
def cmd_convert(args):
    try:
        # ... existing logic
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr); sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr); sys.exit(1)
```

### H4. `_write()` crashes when `path` has no directory component

**File:** `convert.py:28`

```python
def _write(path, text):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
```

`os.path.dirname("output.txt")` returns `""`, which is falsy, so the `or "."` fallback works. But `os.makedirs(".")` with `exist_ok=True` is harmless. This is acceptable but fragile -- if someone passes a path with `./` prefix, it still works.

**Verdict:** Low risk but worth noting the defensive coding is correct.

## Medium Priority Issues

### M1. Duplicate `_escape_html()` implementation

**Files:** `docx_handler.py:78` and `txt_processor.py:51`

Two identical escape functions exist:
```python
def _escape_html(text: str) -> str:
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
```

Meanwhile `epub_writer.py` uses `xml.sax.saxutils.escape()` which is more correct (handles apostrophes too). Three separate HTML-escaping implementations in one skill.

**Fix:** Consolidate to a single utility. If txt_processor.py is kept, move the escape function there and import from it.

### M2. `POSITION_PATTERNS` in Python does not match TypeScript exactly

**Files:** `chapter_detector.py:70-74` vs `chapter-parser.ts:366-370`

The TypeScript POSITION_PATTERNS have the `gm` (global + multiline) flags. The Python patterns are compiled with `re.IGNORECASE | re.MULTILINE`. The TypeScript `gm` patterns are compiled with both global AND multiline. In Python, `re.findall` / `re.finditer` with `re.MULTILINE` handles `^` per-line correctly. This is functionally equivalent.

However, the third pattern `^(\d+)[:\.\s]+(.+)$` is extremely greedy -- any line starting with a number followed by a colon, period, or space will match. This could false-positive on numbered lists, dates ("2024: Year of..."), addresses, etc.

**Impact:** Low -- this is the last-resort fallback pattern, only used if the first two don't match.

### M3. `cover_handler.py` does not validate image file existence before opening

**File:** `cover_handler.py:28`

```python
img = Image.open(input_path)
```

No existence check before `Image.open()`. If `input_path` doesn't exist, the error is `PIL.UnidentifiedImageError` or `FileNotFoundError` depending on the Pillow version. The docstring says it raises `FileNotFoundError`, but the actual exception type from Pillow may not match.

**Fix:** Add explicit check:
```python
if not os.path.exists(input_path):
    raise FileNotFoundError(f"Cover image not found: {input_path}")
```

### M4. `epub_reader.py` -- BeautifulSoup parser "xml" may not handle all EPUB XHTML

**File:** `epub_reader.py:55, 75`

```python
soup = BeautifulSoup(content_html, "xml")
```

The `"xml"` parser requires `lxml` to be installed. If `lxml` is missing, this will raise `FeatureNotFound`. The SKILL.md lists `lxml` as a dependency, but there's no graceful fallback.

### M5. `convert.py` -- `_read()` is unused

**File:** `convert.py:22-24`

```python
def _read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
```

This function is never called. All reading goes through `read_file_content()` from docx_handler.

**Fix:** Remove dead code.

## Low Priority / Observations

### O1. `epub_writer.py` at exactly 200 lines

Right at the project limit. No action needed unless it grows.

### O2. `convert.py` at 198 lines

Also near the limit. The argparse definitions (lines 144-198) are verbose. Consider extracting to a separate CLI definition module if more subcommands are added.

### O3. Good: XSS prevention in epub_writer.py

The `_escape_xml()` function correctly sanitizes all user-provided text before embedding in XHTML. Verified with `<script>`, `<img onerror>`, and `&` character injection -- all properly escaped.

### O4. Good: Consistent chapter detection between TS and Python

The Python `chapter_detector.py` faithfully ports all 22 preset patterns from the TypeScript `chapter-parser.ts`. The regex building blocks (ROMAN, VN_WORDS, CN) are consistent.

### O5. Good: Clean removal of dead code

The commit properly removes `generateEpub()`, `EpubOptions`, `DetectedChapter`, `DocToEpubOptions` type (though missed the usage -- see C1), and `jest.config.js`. No orphaned references remain in the test files.

### O6. `auto_detect_pattern` returns `("auto", 0)` when no patterns match

This is not a bug but worth documenting -- if no pattern matches at all, it returns pattern_id="auto" with 0 matches. The caller (`parse_chapters` when `pattern=None`) then tries to use the "auto" pattern to parse, which will also find 0 matches, resulting in an empty chapter list. This is handled downstream (cmd_detect prints "No chapters detected") but the semantics are slightly confusing.

## Summary

| Category | Count |
|----------|-------|
| Critical | 3 (C1 missing type, C2 dead module, C3 file size) |
| High | 4 (H1 unused var, H2 unused imports, H3 no error handling, H4 _write edge) |
| Medium | 5 (M1-M5) |
| Observations | 6 |

## Recommended Actions (Priority Order)

1. **Fix C1:** Restore `DocToEpubOptions` interface or inline the type in doc-to-epub/index.ts
2. **Fix C2:** Either wire `txt_processor.py` into the CLI or delete it
3. **Fix C3:** Extract position-based detection from chapter-parser.ts into separate module
4. **Fix H3:** Add try/except error handling to all CLI subcommands
5. **Fix H1+H2:** Clean up unused `mime_map`, `Optional`, `field` in epub_writer.py
6. **Fix M5:** Remove unused `_read()` from convert.py
7. **Fix M1:** Consolidate duplicate `_escape_html()` implementations

## Unresolved Questions

1. Is `convertDocToEpub()` used anywhere in the web app? If not, C1 is dormant. If yes, it's a runtime type error waiting to surface.
2. Should `txt_processor.py` be integrated for Markdown-to-EPUB support? The SKILL.md doesn't mention Markdown as an input format for the CLI.
3. The `epub_reader.py` depends on `lxml` for the `"xml"` BeautifulSoup parser -- is this guaranteed to be installed in the skill's venv?
