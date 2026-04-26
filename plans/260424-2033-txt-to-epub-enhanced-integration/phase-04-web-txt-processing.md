# Phase 4: Web App - Enhanced TXT Processing

**Priority:** Medium
**Status:** Pending

## Overview

Add encoding detection, chapter range filtering, and custom regex support to the web app's TypeScript TXT processing pipeline.

## Key Insights

- `txt-processor.ts` reads files with `file.text()` which always uses UTF-8
- Browser `TextDecoder` supports many encodings but needs to know which one
- No reliable browser-side auto-detection library like cchardet
- Can use `encoding-japanese` npm package for CJK encoding detection OR just try common encodings
- Chapter range filtering is pure logic, mirrors Python `filter_chapters_by_range()`
- Custom regex already partially supported via chapter-parser.ts patterns

## Requirements

### Functional
- Detect non-UTF-8 encodings in uploaded TXT files (at minimum: GBK, Big5)
- Allow chapter range selection (start N, end M)
- Allow custom regex pattern input (advanced)
- All processing remains client-side

### Non-functional
- Encoding detection fallback: TextDecoder try common encodings
- No new heavy npm dependencies

## Related Code Files

### Modify
- `src/lib/doc-to-epub/txt-processor.ts` - Add encoding detection + range filter + custom regex
- `src/lib/chapter-parser.ts` - Add custom regex support (if not present)

## Implementation Steps

### 1. Enhance `txt-processor.ts` - Encoding detection

```typescript
const CJK_ENCODINGS = ['utf-8', 'gbk', 'gb2312', 'big5', 'shift-jis', 'euc-jp', 'euc-kr'];

async function detectAndReadFile(file: File): Promise<string> {
  // Try UTF-8 first (most common)
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  // Try UTF-8
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(uint8);
    return text;
  } catch {
    // Not valid UTF-8, try other encodings
  }

  // Try CJK encodings
  for (const enc of CJK_ENCODINGS.slice(1)) {
    try {
      const text = new TextDecoder(enc, { fatal: true }).decode(uint8);
      return text;
    } catch {
      continue;
    }
  }

  // Fallback: UTF-8 with replacement
  return new TextDecoder('utf-8', { fatal: false }).decode(uint8);
}
```

Replace `file.text()` with `detectAndReadFile(file)` in `processTxt()`.

### 2. Add chapter range filtering

```typescript
export interface ChapterRangeFilter {
  start: number; // 0 = no limit
  end: number;   // 0 = no limit
}

export function filterChaptersByRange<T extends { index: number }>(
  chapters: T[],
  range: ChapterRangeFilter
): T[] {
  if (range.start <= 0 && range.end <= 0) return chapters;
  return chapters
    .filter((ch) => {
      if (range.start > 0 && ch.index < range.start) return false;
      if (range.end > 0 && ch.index > range.end) return false;
      return true;
    })
    .map((ch, i) => ({ ...ch, index: i + 1 }));
}
```

### 3. Add custom regex support

```typescript
export function detectWithCustomRegex(
  text: string,
  pattern: string
): DetectedChapter[] {
  try {
    const regex = new RegExp(pattern, 'gm');
    // Use existing chapter-parser logic with custom regex
    // ...
  } catch (e) {
    throw new Error(`Invalid regex pattern: ${(e as Error).message}`);
  }
}
```

### 4. Update `processTxt` to accept options

```typescript
export interface TxtProcessOptions {
  encoding?: string; // 'auto' | 'utf-8' | 'gbk' etc
  customPattern?: string;
  chapterRange?: ChapterRangeFilter;
}

export async function processTxt(
  file: File,
  options?: TxtProcessOptions
): Promise<TxtProcessResult> {
  const text = options?.encoding === 'auto' || !options?.encoding
    ? await detectAndReadFile(file)
    : await file.text();

  // ... existing markdown detection + conversion ...

  return { html, isMarkdown, text };
}
```

## Success Criteria
- [ ] Non-UTF-8 TXT files (GBK, Big5) correctly read in browser
- [ ] `filterChaptersByRange()` filters chapters correctly
- [ ] Custom regex pattern accepted and applied
- [ ] No new npm dependencies required
- [ ] Existing `processTxt()` calls still work (backward compatible)

## Risk Assessment
- Browser TextDecoder encoding support varies → test in Chrome/Firefox
- Some rare encodings not supported by TextDecoder → fallback to UTF-8 with replacement chars
- Custom regex could be ReDoS → no easy browser mitigation, accept user risk
