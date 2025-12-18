# Phase 4: TOC Generation

**Parent:** [plan.md](plan.md)
**Depends on:** Phase 3
**Status:** Pending

---

## Overview

Generate proper Table of Contents with hyperlinks for both EPUB 2.0 (NCX) and EPUB 3.0 (nav).

## Requirements

- `toc.ncx` - NCX format for EPUB 2.0 readers
- `toc.xhtml` - HTML nav for EPUB 3.0 readers
- Clickable links to each chapter

---

## Implementation Steps

### 1. Create toc-generator.ts

```typescript
// src/lib/epub/toc-generator.ts

export function generateTocNcx(
  title: string,
  chapters: EpubChapter[],
  uuid: string
): string {
  const navPoints = chapters.map((ch, i) => `
    <navPoint id="chapter-${String(i+1).padStart(3,'0')}" playOrder="${i+1}">
      <navLabel>
        <text>${escapeXml(ch.title)}</text>
      </navLabel>
      <content src="chapters/chapter-${String(i+1).padStart(3,'0')}.xhtml"/>
    </navPoint>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <navMap>${navPoints}
  </navMap>
</ncx>`;
}
```

### 2. Generate toc.xhtml

```typescript
export function generateTocXhtml(
  title: string,
  chapters: EpubChapter[],
  language: string
): string {
  const items = chapters.map((ch, i) =>
    `<li><a href="chapters/chapter-${String(i+1).padStart(3,'0')}.xhtml">${escapeXml(ch.title)}</a></li>`
  ).join('\n      ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}">
<head>
  <title>Mục Lục</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc">
    <h1>Mục Lục</h1>
    <ol>
      ${items}
    </ol>
  </nav>
</body>
</html>`;
}
```

### 3. Update content.opf

Add to manifest:
```xml
<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
```

Add to spine:
```xml
<itemref idref="toc"/>
```

### 4. Update index.ts

- Call `generateTocNcx()` and `generateTocXhtml()`
- Add both to zip

---

## Related Files

| File | Action |
|------|--------|
| src/lib/epub/toc-generator.ts | Create |
| src/lib/epub/templates.ts | Update |
| src/lib/epub/index.ts | Update |

---

## Success Criteria

- [ ] TOC displays in Kindle
- [ ] TOC displays in Kobo
- [ ] All chapter links work
- [ ] NCX fallback for older readers
