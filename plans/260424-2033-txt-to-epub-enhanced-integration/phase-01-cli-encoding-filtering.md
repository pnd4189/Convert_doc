# Phase 1: CLI - Encoding Detection & Chapter Filtering

**Priority:** High
**Status:** Pending

## Overview

Add automatic encoding detection (cchardet) and chapter range filtering with custom regex support to the Python CLI pipeline.

## Key Insights

- `docx_handler.py:read_file_content()` currently hardcodes `utf-8` for TXT files
- `chapter_detector.py` has 22 presets but no custom regex support in the public API
- `txt_processor.py` only converts to HTML, no filtering capability
- cchardet is C-based, very fast (~10x faster than chardet)

## Requirements

### Functional
- Auto-detect file encoding for TXT files (GBK, Big5, Shift-JIS, UTF-8, etc.)
- Read file with detected encoding, fallback chain
- Filter chapters by range (start N, end M, 0=all)
- Accept custom regex pattern for chapter detection

### Non-functional
- cchardet detection must complete in <100ms for 10MB files
- Graceful fallback when cchardet unavailable (try chardet → utf-8)

## Related Code Files

### Modify
- `~/.claude/skills/convert-doc/scripts/docx_handler.py` - `read_file_content()` use encoding detection
- `~/.claude/skills/convert-doc/scripts/chapter_detector.py` - Add custom regex support to API

### Create
- `~/.claude/skills/convert-doc/scripts/encoding_detector.py` - cchardet wrapper

## Implementation Steps

### 1. Create `encoding_detector.py`

```python
# encoding_detector.py - Auto-detect file encoding via cchardet
import cchardet  # fallback: chardet → utf-8

def detect_encoding(file_path: str) -> str:
    """Detect file encoding. Returns encoding string (e.g. 'UTF-8', 'GBK')."""
    with open(file_path, 'rb') as f:
        raw = f.read()
    result = cchardet.detect(raw)
    return result.get('encoding', 'utf-8') or 'utf-8'

def read_file_with_encoding(file_path: str, encoding: str = 'auto') -> str:
    """Read file with specified or auto-detected encoding."""
    if encoding == 'auto':
        encoding = detect_encoding(file_path)
    with open(file_path, 'r', encoding=encoding, errors='replace') as f:
        return f.read()
```

### 2. Enhance `chapter_detector.py`

Add `filter_chapters_by_range()` function:

```python
def filter_chapters_by_range(chapters: list[Chapter], start: int, end: int) -> list[Chapter]:
    """Filter chapters by range (1-based). start=0 or end=0 means no limit."""
    if start <= 0 and end <= 0:
        return chapters
    filtered = []
    for ch in chapters:
        if start > 0 and ch.index < start:
            continue
        if end > 0 and ch.index > end:
            continue
        filtered.append(ch)
    # Re-index filtered chapters
    for i, ch in enumerate(filtered):
        ch.index = i + 1
    return filtered
```

Add `detect_with_custom_pattern()` function:

```python
def detect_with_custom_pattern(text: str, custom_regex: str) -> list[Chapter]:
    """Detect chapters using a user-provided regex pattern."""
    return parse_chapters(text, pattern=custom_regex)
```

### 3. Enhance `docx_handler.py`

Update `read_file_content()` to accept encoding parameter:

```python
def read_file_content(path: str, encoding: str = 'auto') -> str:
    ext = Path(path).suffix.lower()
    if ext == '.docx':
        return read_docx(path)
    if encoding == 'auto':
        from encoding_detector import read_file_with_encoding
        return read_file_with_encoding(path)
    return Path(path).read_text(encoding=encoding)
```

### 4. Install cchardet

```bash
~/.claude/skills/.venv/bin/pip install cchardet
```

## Success Criteria
- [ ] `encoding_detector.py` auto-detects GBK/Big5/UTF-8 files
- [ ] `filter_chapters_by_range()` correctly filters chapter ranges
- [ ] `detect_with_custom_pattern()` accepts arbitrary regex
- [ ] `read_file_content()` handles non-UTF-8 TXT files
- [ ] cchardet installed in venv

## Risk Assessment
- cchardet may misdetect rare encodings → `errors='replace'` fallback prevents crashes
- Custom regex could be malformed → catch `re.error` and report user-friendly message
