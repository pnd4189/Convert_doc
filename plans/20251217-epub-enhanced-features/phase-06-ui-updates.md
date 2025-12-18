# Phase 6: UI Updates

**Parent:** [plan.md](plan.md)
**Depends on:** Phase 1-5
**Status:** Pending

---

## Overview

Update step-export.tsx with metadata inputs, cover upload, and language selector.

## Requirements

- Collapsible metadata section (author, translator, language)
- Cover image upload with preview
- Size recommendation display
- Maintain existing TXT/EPUB export flow

---

## UI Layout

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
│ │  [+ Chọn ảnh bìa]  [Preview]                │ │
│ │  Khuyến nghị: 1600x2560px (ratio 5:8)       │ │
│ │  Hỗ trợ: JPG, PNG, WebP                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌──────────────┐  ┌──────────────┐             │
│ │  Tải TXT     │  │  Tải EPUB    │             │
│ └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────┘
```

---

## Implementation Steps

### 1. Add state variables

```typescript
const [author, setAuthor] = useState('');
const [translator, setTranslator] = useState('');
const [language, setLanguage] = useState('vi');
const [coverImage, setCoverImage] = useState<File | null>(null);
const [coverPreview, setCoverPreview] = useState<string | null>(null);
const [showMetadata, setShowMetadata] = useState(false);
```

### 2. Language options

```typescript
const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];
```

### 3. Cover upload handler

```typescript
const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }
};
```

### 4. Update handleExportEpub

```typescript
const handleExportEpub = useCallback(async () => {
  const blob = await generateEpub({
    title: fileName,
    author,
    translator,
    language,
    coverImage,
    content,
  });
  saveAs(blob, `${fileName}.epub`);
}, [content, fileName, author, translator, language, coverImage]);
```

### 5. Add UI components

- Collapsible section with chevron toggle
- Input fields for author, translator
- Select dropdown for language
- File input for cover with preview thumbnail
- Info text for recommendations

---

## Related Files

| File | Action |
|------|--------|
| src/components/tab-merge-epub/step-export.tsx | Update |
| src/lib/epub/index.ts | Update signature |

---

## Success Criteria

- [ ] Metadata section collapses/expands
- [ ] Cover preview shows thumbnail
- [ ] Language dropdown works
- [ ] All metadata passed to EPUB generator
- [ ] TXT export still works (no metadata needed)
