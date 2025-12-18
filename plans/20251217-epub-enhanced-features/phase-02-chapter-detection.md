# Phase 2: Chapter Detection

**Parent:** [plan.md](plan.md)
**Depends on:** Phase 1
**Status:** Pending

---

## Overview

Auto-detect chapters from merged content using regex patterns.

## Requirements

- Support Vietnamese patterns: Chương, Hồi, Quyển, Phần
- Support English patterns: Chapter
- Support numeric patterns: "1: ...", "1. ..."
- Fallback to single chapter if no matches

---

## Implementation Steps

### 1. Create chapter-detector.ts

```typescript
// src/lib/epub/chapter-detector.ts

export interface DetectedChapter {
  index: number;
  title: string;
  content: string;
  startPosition: number;
}

const CHAPTER_PATTERNS = [
  /^(Chương|CHƯƠNG|Chapter|CHAPTER)\s+(\d+)[:\.\s]*(.*)?$/gm,
  /^(Hồi|Quyển|Phần)\s+(\d+)[:\.\s]*(.*)?$/gm,
  /^(\d+)[:\.\s]+(.+)$/gm,
];

export function detectChapters(content: string): DetectedChapter[] {
  // 1. Find all chapter markers with positions
  // 2. Split content between markers
  // 3. Return array of chapters with title + content
  // 4. If no chapters found, return single chapter with full content
}
```

### 2. Detection Algorithm

```typescript
function detectChapters(content: string): DetectedChapter[] {
  const markers: Array<{index: number; title: string; position: number}> = [];

  // Try each pattern
  for (const pattern of CHAPTER_PATTERNS) {
    const regex = new RegExp(pattern.source, 'gm');
    let match;
    while ((match = regex.exec(content)) !== null) {
      markers.push({
        index: markers.length + 1,
        title: match[0].trim(),
        position: match.index,
      });
    }
    if (markers.length > 0) break; // Use first matching pattern
  }

  // No chapters found - return single chapter
  if (markers.length === 0) {
    return [{ index: 1, title: 'Nội dung', content, startPosition: 0 }];
  }

  // Split content between markers
  const chapters: DetectedChapter[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].position;
    const end = markers[i + 1]?.position ?? content.length;
    chapters.push({
      index: i + 1,
      title: markers[i].title,
      content: content.slice(start, end).trim(),
      startPosition: start,
    });
  }

  return chapters;
}
```

### 3. Export from index.ts

Add export: `export { detectChapters } from './chapter-detector';`

---

## Related Files

| File | Action |
|------|--------|
| src/lib/epub/chapter-detector.ts | Create |
| src/lib/epub/index.ts | Update exports |

---

## Success Criteria

- [ ] Detects "Chương 1: Tên" format
- [ ] Detects "Chapter 1" format
- [ ] Detects "1. Tên chương" format
- [ ] Returns single chapter when no patterns match
- [ ] Preserves full content (no data loss)
