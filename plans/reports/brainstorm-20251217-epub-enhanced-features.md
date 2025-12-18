# Brainstorm Report: EPUB Enhanced Features

**Date:** 2025-12-17
**Status:** Agreed
**Topic:** Metadata, TOC with Hyperlinks, Cover Image

---

## Problem Statement

Current EPUB generation creates a single-file content structure without:
- Proper chapter separation with navigation
- Table of Contents with clickable hyperlinks
- Book metadata (author, translator info per chapter)
- Cover image support

---

## Requirements Confirmed

| Feature | Decision |
|---------|----------|
| Chapter header format | Title > Author > Translator > Chapter X |
| Translator input | Add input field for user |
| Chapter detection | Auto-detect via regex from merged content |
| Cover image processing | Automatic resize/crop |
| Language selection | User selectable (default: vi) |
| Cover size recommendation | 1600x2560px (ratio 5:8) |

---

## Recommended Solution: Modular Refactor

### New File Structure

```
src/lib/epub/
├── types.ts              # Interfaces: EpubOptions, EpubChapter, CoverConfig
├── templates.ts          # XML/HTML template generators
├── cover-handler.ts      # Cover image resize/crop/validation
├── toc-generator.ts      # TOC generation (ncx + xhtml)
├── chapter-builder.ts    # Build individual chapter XHTML files
├── chapter-detector.ts   # Auto-detect chapters from content
├── utils.ts              # escapeXml, generateUUID, textToHtml
└── index.ts              # Main orchestrator (generateEpub, generateEpubWithChapters)
```

### EPUB Structure Output

```
mimetype
META-INF/
└── container.xml
OEBPS/
├── content.opf           # Package document with full metadata
├── toc.ncx               # NCX navigation (EPUB 2.0)
├── toc.xhtml             # HTML TOC with hyperlinks (EPUB 3.0 compatible)
├── style.css
├── cover.xhtml           # Cover page (if image provided)
├── images/
│   └── cover.jpg         # Resized cover image
└── chapters/
    ├── chapter-001.xhtml
    ├── chapter-002.xhtml
    └── ...
```

---

## Technical Specifications

### 1. Types Interface

```typescript
interface EpubMetadata {
  title: string;
  author?: string;
  translator?: string;
  description?: string;
  publisher?: string;
  language: string;  // 'vi' | 'en' | 'zh' | etc
  coverImage?: File | Blob | null;
}

interface EpubChapter {
  index: number;
  title: string;       // "Chương 1: Tên chương"
  content: string;
  // Inherited from metadata but can be overridden per chapter
  author?: string;
  translator?: string;
}

interface CoverConfig {
  targetWidth: number;   // 1600
  targetHeight: number;  // 2560
  quality: number;       // 0.9
  format: 'jpeg' | 'webp';
}
```

### 2. Chapter Header Template

Each chapter XHTML will display:

```html
<div class="chapter-header">
  <p class="book-title">{Book Title}</p>
  <p class="author">Tác giả: {Author}</p>
  <p class="translator">Dịch giả: {Translator}</p>
  <h1 class="chapter-title">{Chapter Title}</h1>
</div>
<div class="chapter-content">
  {Content}
</div>
```

### 3. Chapter Detection Regex Patterns

```typescript
const CHAPTER_PATTERNS = [
  /^(Chương|Chapter|CHƯƠNG|CHAPTER)\s*(\d+)[:\.\s]*(.*)?$/gm,
  /^(Hồi|Quyển|Phần)\s*(\d+)[:\.\s]*(.*)?$/gm,
  /^(\d+)[:\.\s]+(.+)$/gm,  // "1: Tên chương" or "1. Tên chương"
];
```

### 4. Cover Image Processing

Using Canvas API (browser-native):

```typescript
async function processcover(file: File): Promise<Blob> {
  // 1. Load image
  // 2. Calculate crop area (center crop to 5:8 ratio)
  // 3. Resize to 1600x2560
  // 4. Export as JPEG quality 0.9
  // 5. Return Blob
}
```

### 5. TOC.xhtml Template

```html
<nav epub:type="toc">
  <h1>Mục Lục</h1>
  <ol>
    <li><a href="chapters/chapter-001.xhtml">Chương 1: ...</a></li>
    <li><a href="chapters/chapter-002.xhtml">Chương 2: ...</a></li>
    ...
  </ol>
</nav>
```

---

## UI Changes Required

### Step Export Component Updates

```
┌─────────────────────────────────────────────────┐
│ Bước 4: Xuất file                               │
├─────────────────────────────────────────────────┤
│ Tên file: [________________________]            │
│                                                 │
│ ▼ Thông tin sách (optional)                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Tác giả:   [________________________]       │ │
│ │ Dịch giả:  [________________________]       │ │
│ │ Ngôn ngữ:  [Tiếng Việt ▼]                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Ảnh bìa (optional)                             │
│ ┌─────────────────────────────────────────────┐ │
│ │  [+ Chọn ảnh bìa]                           │ │
│ │  Khuyến nghị: 1600x2560px (ratio 5:8)       │ │
│ │  Hỗ trợ: JPG, PNG, WebP                     │ │
│ └─────────────────────────────────────────────┘ │
│ [Preview thumbnail if uploaded]                 │
│                                                 │
│ ┌──────────────┐  ┌──────────────┐             │
│ │  Tải TXT     │  │  Tải EPUB    │             │
│ └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────┘
```

### Language Options

```typescript
const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];
```

---

## Implementation Priority

| Phase | Tasks | Complexity |
|-------|-------|------------|
| 1 | Refactor to modular structure, types | Medium |
| 2 | Chapter detection + multi-file EPUB | High |
| 3 | TOC generation (ncx + xhtml) | Medium |
| 4 | Cover image processing | Medium |
| 5 | UI updates (metadata inputs, cover upload) | Low |
| 6 | Testing & edge cases | Medium |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Chapter detection fails | Provide manual split option or fallback to single-chapter |
| Large images slow down processing | Show progress indicator, use Web Workers |
| Browser memory limits | Limit cover image size to 10MB |
| EPUB validation errors | Test with calibre, Adobe Digital Editions |

---

## Success Metrics

- [ ] EPUB opens correctly in Kindle, Kobo, Apple Books
- [ ] TOC hyperlinks navigate to correct chapters
- [ ] Cover displays properly on all e-readers
- [ ] Chapter headers show: Title > Author > Translator > Chapter
- [ ] Auto-detection works for 90%+ of standard chapter formats

---

## Next Steps

1. Create modular file structure under `src/lib/epub/`
2. Implement chapter-detector.ts with regex patterns
3. Update epub-generator to produce multi-chapter structure
4. Add cover-handler.ts with Canvas resize
5. Update UI component with new input fields
6. End-to-end testing with sample content

---

## Unresolved Questions

None - all requirements clarified.
