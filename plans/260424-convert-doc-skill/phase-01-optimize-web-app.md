# Phase 1: Optimize Web App

**Priority:** High
**Status:** pending
**Description:** Unify duplicate chapter detection, remove dead code, consistent EPUB 3.0

## Key Insights

- Two chapter detection systems with overlapping regex patterns but different interfaces
- `chapter-parser.ts`: rich presets (VN/CN/EN), `Chapter` type with `startLine`/`endLine`
- `epub/chapter-detector.ts`: simpler patterns, `DetectedChapter` type with `startPosition`
- `epub/chapter-detector.ts` only used by `doc-to-epub/index.ts` and re-exported from `epub/index.ts`
- `generateEpub()` (single-chapter EPUB 2.0) not called by any component tab
- `jest.config.js` references non-existent `src/temp-tests/`

## Files to Modify

- `src/lib/chapter-parser.ts` — merge `epub/chapter-detector.ts` patterns into this
- `src/lib/epub/chapter-detector.ts` — DELETE, replaced by unified module
- `src/lib/epub/types.ts` — remove `EpubOptions`, `DetectedChapter` (use `Chapter`)
- `src/lib/epub/index.ts` — remove `generateEpub()`, re-exports of deleted types, import from `chapter-parser.ts`
- `src/lib/doc-to-epub/index.ts` — update imports from `chapter-parser.ts` instead of `epub/chapter-detector.ts`
- `jest.config.js` — DELETE
- `src/app/page.tsx` — add error boundary wrapper

## Files to Delete

- `src/lib/epub/chapter-detector.ts`
- `jest.config.js`

## Implementation Steps

### Step 1: Unify Chapter Types

In `chapter-parser.ts`, add `DetectedChapter` compatibility:

```typescript
// Add to existing Chapter interface - make endLine optional
export interface Chapter {
  index: number;
  title: string;
  startLine: number;
  endLine?: number;  // optional for detectors that don't track lines
  content: string;
  startPosition?: number;  // for char-position-based detection
}
```

### Step 2: Merge Detection Patterns

In `chapter-parser.ts`, add the `detectChapters()` and `getChapterCount()` functions from `epub/chapter-detector.ts`, using the unified `Chapter` type. The existing `parseChapters()` already covers line-based detection. Add char-position variant:

```typescript
export function detectChaptersByPosition(content: string): Chapter[] {
  // Port logic from epub/chapter-detector.ts detectChapters()
  // Return Chapter[] with startPosition filled
}
```

### Step 3: Delete epub/chapter-detector.ts

Remove the file. Update `epub/index.ts` to re-export from `chapter-parser.ts`:

```typescript
export { detectChaptersByPosition as detectChapters, getChapterCount } from '@/lib/chapter-parser';
```

### Step 4: Remove Dead Code

- Delete `jest.config.js`
- Remove `generateEpub()` from `epub/index.ts`
- Remove `EpubOptions` and `DetectedChapter` from `epub/types.ts`
- Remove `DocToEpubOptions` from `doc-to-epub/index.ts` (unused as param type)

### Step 5: Update doc-to-epub/index.ts

Change `detectChapters` import from `@/lib/epub` to `@/lib/chapter-parser`:

```typescript
import { detectChaptersByPosition } from '@/lib/chapter-parser';
```

### Step 6: Add Error Boundary

Create minimal error boundary component in `src/components/ui/error-boundary.tsx` and wrap tab content in `page.tsx`.

### Step 7: Run Tests

```bash
npx vitest run
```

All 34 tests must pass. Fix any regressions from the refactoring.

## Success Criteria

- [ ] No duplicate chapter detection code
- [ ] `epub/chapter-detector.ts` deleted
- [ ] `jest.config.js` deleted
- [ ] `generateEpub()` removed
- [ ] `EpubOptions` and `DetectedChapter` interfaces removed
- [ ] `DocToEpubOptions` removed
- [ ] Error boundary wraps tab content
- [ ] All 34 tests pass
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
