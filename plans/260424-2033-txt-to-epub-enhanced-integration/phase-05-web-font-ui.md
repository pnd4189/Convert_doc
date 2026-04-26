# Phase 5: Web App - Font Embedding & UI Updates

**Priority:** Medium
**Status:** Pending
**Depends on:** Phase 4

## Overview

Add CJK font embedding to JSZip EPUB generation and update Tab 4 UI components with chapter range selector, custom regex input, and font upload controls.

## Key Insights

- `src/lib/epub/` uses JSZip for EPUB generation
- Font embedding: add font file to EPUB ZIP, reference via `@font-face` in CSS
- Tab 4 (`tab-doc-to-epub/`) has 6 step components in a wizard pattern
- UI is Vietnamese, new controls must match existing style
- Web app can't use Pandoc (system dependency) - only JSZip backend

## Requirements

### Functional
- Embed uploaded font file into EPUB (JSZip)
- CJK font-face CSS available as style option
- Chapter range inputs (start/end number fields) in Step 3
- Custom regex input (advanced/collapsible) in Step 3
- Font file upload in Step 2 (metadata step)

### Non-functional
- Font file upload should accept .otf, .ttf, .woff, .woff2
- Font files can be large → show file size warning if >5MB
- Range inputs validated: start <= end, both >0 or both =0

## Related Code Files

### Modify
- `src/lib/epub/styles.ts` - Add CJK font-face CSS
- `src/lib/epub/chapter-builder.ts` - Add font to manifest (OPF entries)
- `src/components/tab-doc-to-epub/step-metadata.tsx` - Add font upload
- `src/components/tab-doc-to-epub/step-chapters.tsx` - Add range selector + regex input
- `src/components/tab-doc-to-epub/index.tsx` - Pass font/range/regex state
- `src/components/tab-doc-to-epub/step-export.tsx` - Use font in EPUB generation

## Implementation Steps

### 1. Enhance `styles.ts` - Add CJK CSS

```typescript
export function getCjkStyles(fontFileName: string): string {
  return `@font-face {
    font-family: 'EmbeddedCJK';
    src: url('fonts/${fontFileName}');
    font-weight: normal;
    font-style: normal;
}
body { font-family: 'EmbeddedCJK', sans-serif; line-height: 1.7; text-align: justify; }
p { text-indent: 2em; margin-top: 0.5em; margin-bottom: 0.5em; }
h1, h2, h3 { font-family: 'EmbeddedCJK', sans-serif; font-weight: bold; text-align: left; margin-top: 2em; margin-bottom: 1em; line-height: 1.4; }`;
}
```

### 2. Enhance `chapter-builder.ts` / EPUB generation

Add font to OPF manifest and ZIP:

```typescript
// In the EPUB generation flow:
if (fontFile) {
  const fontData = await fontFile.arrayBuffer();
  zip.file('OEBPS/fonts/' + fontFile.name, fontData);
  // Add to content.opf manifest:
  // <item id="embedded-font" href="fonts/xxx.otf" media-type="font/otf"/>
}
```

### 3. Update `step-metadata.tsx` - Add font upload

Add a file input for font files after the cover image section:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Font chữ (tùy chọn)
  </label>
  <p className="text-xs text-gray-500 mb-2">
    Hỗ trợ .otf, .ttf, .woff, .woff2. Nhúng font vào EPUB cho tiếng Trung/Nhật/Hàn.
  </p>
  <input
    type="file"
    accept=".otf,.ttf,.woff,.woff2"
    onChange={(e) => onFontChange(e.target.files?.[0] || null)}
  />
</div>
```

### 4. Update `step-chapters.tsx` - Add range + regex

Add chapter range inputs:

```tsx
<div className="flex gap-4 items-end">
  <div>
    <label className="block text-sm font-medium text-gray-700">Từ chương</label>
    <input type="number" min={0} value={startChapter} onChange={...} className="..." />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">Đến chương</label>
    <input type="number" min={0} value={endChapter} onChange={...} className="..." />
  </div>
  <Button onClick={applyRange} size="sm">Áp dụng</Button>
  <span className="text-xs text-gray-500">Để 0 để chọn tất cả</span>
</div>
```

Add collapsible advanced regex:

```tsx
<details className="mt-4">
  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
    Cài đặt nâng cao (Regex tùy chỉnh)
  </summary>
  <div className="mt-2 space-y-2">
    <input
      type="text"
      value={customRegex}
      placeholder='Ví dụ: ^第[一二三四五六七八九十百千万0-9]+[章回]'
      className="w-full border rounded px-3 py-2 text-sm font-mono"
    />
    <Button onClick={applyCustomRegex} size="sm">Phát hiện lại</Button>
  </div>
</details>
```

### 5. Update `index.tsx` - Thread new state

Add state for `fontFile`, `startChapter`, `endChapter`, `customRegex` and pass through step components.

### 6. Update `step-export.tsx` - Use font in generation

When generating EPUB, check if font file is provided and use CJK CSS + embed font.

## Success Criteria
- [ ] Font file (.otf/.ttf) embeds into generated EPUB
- [ ] CJK CSS applied when font embedded
- [ ] Chapter range selector filters chapters correctly in UI
- [ ] Custom regex input re-detects chapters
- [ ] All new inputs have Vietnamese labels
- [ ] Existing Tab 4 flow still works without new inputs
- [ ] Font size warning shown for files >5MB

## Risk Assessment
- Large font files slow down EPUB generation → show progress
- Some EPUB readers may not support embedded fonts → note in UI
- Custom regex could match nothing → show "no chapters found" message
