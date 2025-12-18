# Phase 1: Modular Refactor

**Parent:** [plan.md](plan.md)
**Status:** Pending
**Priority:** High

---

## Overview

Extract monolithic `epub-generator.ts` into modular structure under `src/lib/epub/`.

## Requirements

- Maintain backward compatibility with existing `generateEpub` signature
- Separate concerns: types, utils, templates
- Prepare foundation for multi-chapter support

---

## Target Structure

```
src/lib/epub/
├── types.ts           # Interfaces
├── utils.ts           # escapeXml, generateUUID, textToHtml
├── templates.ts       # XML/HTML template generators
├── styles.ts          # CSS for EPUB content
└── index.ts           # Main exports (generateEpub, generateEpubWithChapters)
```

---

## Implementation Steps

### 1. Create types.ts
```typescript
export interface EpubMetadata {
  title: string;
  author?: string;
  translator?: string;
  language?: string;
  coverImage?: File | Blob | null;
}

export interface EpubChapter {
  index: number;
  title: string;
  content: string;
}

export interface CoverConfig {
  targetWidth: number;   // 1600
  targetHeight: number;  // 2560
  quality: number;       // 0.8
}
```

### 2. Create utils.ts
- Move `generateUUID()`, `escapeXml()`, `textToHtml()` from epub-generator.ts

### 3. Create templates.ts
- `generateContainerXml()` - META-INF/container.xml
- `generateContentOpf()` - OEBPS/content.opf
- `generateTocNcx()` - OEBPS/toc.ncx
- `generateChapterXhtml()` - Chapter content

### 4. Create styles.ts
- `getEpubStyles()` - CSS for body, chapter headers, paragraphs

### 5. Create index.ts
- Import from all modules
- Re-export `generateEpub`, `generateEpubWithChapters`
- Maintain backward compatibility

### 6. Update imports
- Update `step-export.tsx` to import from `@/lib/epub`
- Delete old `epub-generator.ts`

---

## Related Files

| File | Action |
|------|--------|
| src/lib/epub-generator.ts | Refactor → delete |
| src/lib/epub/types.ts | Create |
| src/lib/epub/utils.ts | Create |
| src/lib/epub/templates.ts | Create |
| src/lib/epub/styles.ts | Create |
| src/lib/epub/index.ts | Create |
| src/components/tab-merge-epub/step-export.tsx | Update import |

---

## Success Criteria

- [ ] `npm run build` passes
- [ ] Existing EPUB generation still works
- [ ] Import path `@/lib/epub` works
- [ ] Each module under 100 lines
