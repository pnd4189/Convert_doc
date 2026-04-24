# Phase 2: Python Chapter Detector

**Priority:** High
**Status:** pending
**Description:** Port chapter detection logic from TypeScript to Python with all VN/CN/EN patterns

## Key Insights

- Direct port from `src/lib/chapter-parser.ts` — the authoritative source with 25+ preset patterns
- Python `re` module supports multiline matching with `re.MULTILINE` flag
- Vietnamese number words, Chinese numerals, Roman numerals must be ported exactly
- `normalizeText()` handles BOM, CRLF, zero-width chars — critical for Vietnamese/Chinese text

## Files to Create

- `~/.claude/skills/convert-doc/scripts/chapter_detector.py`

## Architecture

```python
# chapter_detector.py

@dataclass
class PresetPattern:
    id: str
    name: str
    description: str
    pattern: str  # raw regex string

@dataclass
class Chapter:
    index: int
    title: str
    content: str
    start_line: int
    end_line: int

# Constants
ROMAN_NUMERAL = r"(?:M{0,3})(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})"
VN_NUMBER_WORDS = r"(?:một|hai|ba|...)"
CHINESE_NUMBERS = r"(?:[一二三四五六七八九十百千万亿壹贰叁肆伍陆柒捌玖拾佰仟萬億零〇]+)"

PRESET_PATTERNS: list[PresetPattern] = [
    # Vietnamese: chuong, hoi, quyen, phan, muc
    # Chinese: di-zhang, di-hui, di-jie, juan
    # English: chapter, part, book, volume, section, episode
    # Auto-detect composite
]

def normalize_text(text: str) -> str: ...
def parse_chapters(text: str, pattern: str | None = None) -> list[Chapter]: ...
def auto_detect_pattern(text: str) -> tuple[str, int]: ...
def detect_chapters(text: str) -> list[Chapter]: ...
def get_chapter_count(text: str) -> int: ...
```

## Implementation Steps

### Step 1: Define Constants and Patterns

Port all regex constants from `chapter-parser.ts`:
- `ROMAN_NUMERAL` pattern
- `VN_NUMBER_WORDS` (Vietnamese number words: một→chín, mười, hai mươi, etc.)
- `CHINESE_NUMBERS` (simplified + traditional + formal)
- All 25+ `PRESET_PATTERNS` entries

### Step 2: Implement normalize_text()

```python
def normalize_text(text: str) -> str:
    text = text.lstrip('﻿')  # Remove BOM
    text = text.replace('\r\n', '\n').replace('\r', '\n')  # Normalize line endings
    text = re.sub(r'[​-‍﻿]', '', text)  # Remove zero-width
    return text
```

### Step 3: Implement parse_chapters()

Line-based chapter parsing, matching `chapter-parser.ts` logic exactly:
- Normalize text first
- Split into lines
- Find all chapter start positions using pattern
- Build Chapter objects with content slices

### Step 4: Implement auto_detect_pattern()

Test each preset pattern against text, return best match (most matches).

### Step 5: Implement detect_chapters() and get_chapter_count()

Char-position-based detection (from `epub/chapter-detector.ts`):
- `detect_chapters()` returns chapters with content, handles preface
- `get_chapter_count()` is a lightweight count-only version

### Step 6: Test with Sample Texts

Create inline test cases for each pattern category:
- Vietnamese: "Chương 1: Mở đầu\nNội dung..."
- Chinese: "第一章 开始\n内容..."
- English: "Chapter 1: The Beginning\nContent..."
- Auto-detect: mixed text

## Success Criteria

- [ ] All 25+ preset patterns ported correctly
- [ ] `normalize_text()` handles BOM, CRLF, zero-width chars
- [ ] `parse_chapters()` works with explicit pattern
- [ ] `auto_detect_pattern()` returns best matching pattern
- [ ] `detect_chapters()` handles preface (Lời mở đầu)
- [ ] `get_chapter_count()` returns correct count
- [ ] Vietnamese, Chinese, English patterns all work
- [ ] File under 200 lines
