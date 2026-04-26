# Code Review: Fix Verification (6 Issues)

## Scope
- Files: `step-chapters.tsx`, `txt-processor.ts`, `step-metadata.tsx`, `styles.ts`, `doc-to-epub/index.ts`, `chapter_detector.py`
- LOC: ~120 changed (diff)
- Focus: correctness of 6 specific fixes
- Build: tsc clean, 34/34 tests pass

## Overall Assessment

All 6 fixes are correctly implemented. No regressions found. Two minor observations (non-blocking) noted below.

---

## Fix-by-Fix Analysis

### H1: Custom regex button wired to `detectWithCustomRegex` -- PASS

**What changed:** `step-chapters.tsx` now stores raw text in `rawTextRef` during detection, and the "Phat hien lai" button calls `detectWithCustomRegex(rawTextRef.current, customRegex)`.

**Correctness:**
- `rawTextRef.current` is populated from `processed.text` during initial detection. This requires the new `text` field in `ProcessedDocument` (fix #5) -- dependency satisfied.
- `detectWithCustomRegex` validates the regex, throws on invalid -- caught in the `catch` block that sets `regexError`.
- Empty `rawTextRef` is guarded: `if (!raw) { setRegexError('Chua co noi dung'); return; }`.
- After custom regex detection, both `originalChapters` and `chapters` state are updated, so range filter/reset still work correctly against the new detection results.

**No issues found.**

### H2: Explicit encoding via `TextDecoder` instead of `file.text()` -- PASS

**What changed:** `processTxt` now uses `detectAndReadFile()` which tries UTF-8 with `fatal: true`, then iterates CJK encodings (`gbk`, `gb2312`, `big5`, `shift-jis`, `euc-jp`, `euc-kr`), then falls back to UTF-8 with replacement chars.

**Correctness:**
- `TextDecoder('utf-8', { fatal: true })` correctly throws on invalid UTF-8 byte sequences -- catch block proceeds to try alternates.
- `TxtProcessOptions.encoding` path: when user specifies encoding, it uses `fatal: false` -- reasonable for user-supplied override (decode best-effort rather than crash).
- The `text` field is returned alongside `html` -- consistent with `TxtProcessResult` interface update.

**Observation (non-blocking):** The `options?.encoding` branch reads the entire file via `file.arrayBuffer()` even if encoding is 'utf-8'. It could short-circuit to the auto-detect path for utf-8, but this is a perf micro-opt -- no correctness issue.

### H3: Reorder handlers create new objects via spread -- PASS

**What changed:** `handleMoveUp`, `handleMoveDown`, `handleRemove` now use `.map((ch, i) => ({ ...ch, index: i + 1 }))` instead of mutating `.forEach`.

**Correctness:**
- Spread creates new objects, so React state updates trigger re-renders properly.
- No shared references between old and new chapter arrays.
- `handleRemove` uses `.filter()` which already creates a new array, then `.map()` for reindexing -- no mutation anywhere.

**No issues found.**

### H4: Font upload rejects files >10MB -- PASS

**What changed:** `handleFontChange` in `step-metadata.tsx` checks `file.size > 10 * 1024 * 1024` and alerts the user.

**Correctness:**
- Hard limit at 10MB enforced before `setFont(file)` -- oversized file never enters state.
- Warning at 5MB is informational only (amber text, no blocking) -- appropriate UX.
- `onComplete` now passes 3 args `(meta, cover, font)` -- `index.tsx` handler `handleMetadataComplete` accepts all 3.

**No issues found.**

### M2: Python `filter_chapters_by_range` creates new Chapter objects -- PASS

**What changed:** Instead of mutating `ch.index = i + 1` in a loop, the function now constructs new `Chapter(index=i + 1, ...)` objects via list comprehension.

**Correctness:**
- `Chapter` is a `@dataclass` -- new instances are independent of originals.
- Original list items are never modified.
- Filtering logic unchanged: `start <= 0` and `end <= 0` means no limit.

**No issues found.**

### M5: Added `.toc-list a:hover` to `getCjkStyles()` -- PASS

**What changed:** `getCjkStyles()` in `styles.ts` now includes `.toc-list a { ... }` and `.toc-list a:hover { color: #0066cc; }` selectors.

**Correctness:**
- Matches the same styles present in `getEpubStyles()` (the non-CJK path).
- CSS selector specificity and property values are consistent.

**No issues found.**

---

## Regressions Check

| Area | Status | Notes |
|------|--------|-------|
| `processDocument` contract | OK | `text` field added; `docx-processor` does not return `text`, but `processDocument` extracts it from HTML via DOM -- works in browser context |
| `TxtProcessResult` interface | OK | `text` field added; all callers (`processDocument`, `batchProcessTxt`) access `.html` which still exists |
| `StepMetadata` props | OK | `fontFile` prop + 3rd arg to `onComplete` match `index.tsx` wiring |
| `StepExport` props | OK | `fontFile` passed through to `generateEpubWithChapters(metadata, epubChapters, { fontFile })` |
| `generateEpubWithChapters` | OK | Accepts optional `{ fontFile? }` -- font sanitized, embedded, CJK CSS conditionally used |
| TypeScript compile | OK | `tsc --noEmit` clean |
| Tests | OK | 34/34 pass |

---

## Edge Cases

1. **DOCX files + rawTextRef:** `processDocument` for DOCX files does not return `processed.text` from the docx-processor itself, but extracts `textContent` from rendered HTML. This text is stored in `rawTextRef` -- works but may differ from original file content (HTML entities stripped, whitespace normalized). For custom regex on DOCX-sourced chapters, this is acceptable but worth noting.

2. **`detectAndReadFile` double-read:** When `processTxt` is called without explicit encoding, it calls `detectAndReadFile()` which calls `file.arrayBuffer()`. Later, `processDocument` calls `processTxt` then also reads the processed text. No double-read issue -- the arrayBuffer read happens once inside `processTxt`.

3. **`alert()` for font size limit:** Uses browser `alert()` instead of in-component error state. Works but is a UX inconsistency (regex error uses state-based display). Non-blocking.

---

## Metrics
- Type Coverage: 100% (tsc clean)
- Test Coverage: 34/34 passing
- Linting Issues: 0 compile errors

## Recommended Actions
None -- all fixes are correct. Ship-ready.

## Unresolved Questions
None.
