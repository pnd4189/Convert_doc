# Phase 3: Multi-Chapter EPUB

**Parent:** [plan.md](plan.md)
**Depends on:** Phase 1, Phase 2
**Status:** Pending

---

## Overview

Generate EPUB with separate XHTML file per chapter instead of single content file.

## Requirements

- Each chapter as `chapters/chapter-001.xhtml`
- Chapter header: Title > Author > Translator > Chapter
- Update manifest and spine in content.opf

---

## EPUB Structure

```
OEBPS/
├── content.opf
├── toc.ncx
├── style.css
└── chapters/
    ├── chapter-001.xhtml
    ├── chapter-002.xhtml
    └── ...
```

---

## Implementation Steps

### 1. Create chapter-builder.ts

```typescript
// src/lib/epub/chapter-builder.ts

export interface ChapterBuildOptions {
  chapter: EpubChapter;
  metadata: EpubMetadata;
}

export function buildChapterXhtml(options: ChapterBuildOptions): string {
  const { chapter, metadata } = options;
  const { title, author, translator, language } = metadata;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${language || 'vi'}">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="../style.css"/>
</head>
<body>
  <div class="chapter-header">
    <p class="book-title">${escapeXml(title)}</p>
    ${author ? `<p class="author">Tác giả: ${escapeXml(author)}</p>` : ''}
    ${translator ? `<p class="translator">Dịch giả: ${escapeXml(translator)}</p>` : ''}
    <h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
  </div>
  <div class="chapter-content">
    ${textToHtml(chapter.content)}
  </div>
</body>
</html>`;
}
```

### 2. Update templates.ts

Add `generateContentOpfMultiChapter()`:
- Loop chapters to generate manifest items
- Generate spine itemrefs

```typescript
export function generateContentOpfMultiChapter(
  metadata: EpubMetadata,
  chapters: EpubChapter[],
  uuid: string
): string {
  const manifestItems = chapters.map((ch, i) =>
    `<item id="chapter-${String(i+1).padStart(3,'0')}" href="chapters/chapter-${String(i+1).padStart(3,'0')}.xhtml" media-type="application/xhtml+xml"/>`
  ).join('\n    ');

  const spineItems = chapters.map((_, i) =>
    `<itemref idref="chapter-${String(i+1).padStart(3,'0')}"/>`
  ).join('\n    ');

  // Return full content.opf with manifest and spine
}
```

### 3. Update index.ts

Modify `generateEpubWithChapters()`:
- Use `detectChapters()` if chapters not provided
- Build individual chapter files
- Add to zip in `OEBPS/chapters/`

---

## Related Files

| File | Action |
|------|--------|
| src/lib/epub/chapter-builder.ts | Create |
| src/lib/epub/templates.ts | Update |
| src/lib/epub/index.ts | Update |

---

## Success Criteria

- [ ] Each chapter in separate XHTML file
- [ ] Chapter headers display correctly
- [ ] E-reader navigation between chapters works
- [ ] Backward compatibility maintained
