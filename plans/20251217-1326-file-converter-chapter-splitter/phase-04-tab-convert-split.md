# Phase 04: Tab 1 - Convert & Split

**Parent:** [plan.md](./plan.md)
**Depends on:** Phase 02, Phase 03
**Status:** Pending
**Priority:** High

---

## Overview

Implement Tab 1 wizard: Upload → Convert (optional) → Detect chapters → Split config → Download ZIP.

---

## User Flow

```
Bước 1: Tải file lên (max 10 files)
         ↓
Bước 2: Chuyển đổi TXT↔DOCX (có thể bỏ qua)
         ↓
Bước 3: Chọn pattern → Đếm chương → Preview
         ↓
Bước 4: Chọn số chương/file → Xem số file tách
         ↓
Bước 5: Tải ZIP
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/tab-convert-split/index.tsx` | Main container |
| `src/components/tab-convert-split/step-upload.tsx` | Step 1 |
| `src/components/tab-convert-split/step-convert.tsx` | Step 2 |
| `src/components/tab-convert-split/step-detect-chapters.tsx` | Step 3 |
| `src/components/tab-convert-split/step-split-config.tsx` | Step 4 |
| `src/components/tab-convert-split/step-download.tsx` | Step 5 |

---

## Implementation Steps

### Step 1: index.tsx (Container)

```typescript
const STEPS = [
  { id: 'upload', title: 'Tải file lên' },
  { id: 'convert', title: 'Chuyển đổi' },
  { id: 'detect', title: 'Nhận diện chương' },
  { id: 'split', title: 'Cấu hình tách' },
  { id: 'download', title: 'Tải về' },
];

interface TabState {
  files: File[];
  convertedFiles: FileInfo[];
  selectedPattern: string;
  customPattern: string;
  chapters: Chapter[];
  chaptersPerFile: number;
  currentStep: number;
}

export function TabConvertSplit();
```

### Step 2: step-upload.tsx

Features:
- FileDropzone component
- Accept: `.txt, .doc, .docx`
- Max 10 files
- Show file list với size
- Next/Previous buttons

```typescript
interface StepUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onNext: () => void;
}
```

### Step 3: step-convert.tsx

Features:
- Show file list
- Checkbox: "Chuyển TXT → DOCX" / "Chuyển DOCX → TXT"
- Skip button ("Bỏ qua")
- Progress bar for conversion
- Next when done

```typescript
interface StepConvertProps {
  files: File[];
  onConvert: (convertedFiles: FileInfo[]) => void;
  onSkip: () => void;
  onBack: () => void;
}
```

### Step 4: step-detect-chapters.tsx

Features:
- Pattern selector (preset dropdown)
- Custom regex input (toggle to show)
- "Kiểm tra" button → parse chapters
- Show chapter count
- Preview table (first 5 chapters: title, line range)
- Error message if pattern fails

```typescript
interface StepDetectProps {
  content: string;
  onChaptersDetected: (chapters: Chapter[]) => void;
  onBack: () => void;
}
```

UI Layout:
```
┌─────────────────────────────────────────────┐
│ Chọn pattern nhận diện chương:              │
│ [Dropdown: Chương X ▼]                      │
│                                             │
│ □ Sử dụng regex tùy chỉnh                   │
│   [Input: ^Chương\s+\d+           ]         │
│                                             │
│ [Kiểm tra pattern]                          │
│                                             │
│ ✓ Tìm thấy 2000 chương                      │
│                                             │
│ Preview:                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ # │ Tiêu đề          │ Dòng            │ │
│ │ 1 │ Chương 1: Mở đầu │ 1-45            │ │
│ │ 2 │ Chương 2: ...    │ 46-89           │ │
│ │ ...                                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [← Quay lại]              [Tiếp tục →]      │
└─────────────────────────────────────────────┘
```

### Step 5: step-split-config.tsx

Features:
- Input: "Số chương mỗi file" (default: 10)
- Auto-calculate: "Sẽ tạo ra X file"
- File naming preview
- Next button

```typescript
interface StepSplitProps {
  chapters: Chapter[];
  baseName: string;
  onConfigured: (chaptersPerFile: number) => void;
  onBack: () => void;
}
```

### Step 6: step-download.tsx

Features:
- Progress bar (generating ZIP)
- Download button
- "Làm lại" button (reset wizard)

```typescript
interface StepDownloadProps {
  files: ZipFile[];
  zipName: string;
  onReset: () => void;
}
```

---

## State Flow

```
files → convert → content → parseChapters → chapters
                                              ↓
                              chaptersPerFile → splitByChapters → ZipFiles
                                                                    ↓
                                                              createZip → download
```

---

## Todo List

- [ ] Create index.tsx với stepper state
- [ ] Implement step-upload.tsx
- [ ] Implement step-convert.tsx
- [ ] Implement step-detect-chapters.tsx với pattern preview
- [ ] Implement step-split-config.tsx với calculator
- [ ] Implement step-download.tsx
- [ ] Wire up state management
- [ ] Add loading states
- [ ] Add error handling

---

## Success Criteria

- Upload 10 files works
- Convert TXT↔DOCX works
- Pattern detection shows correct chapter count
- Preview shows first 5 chapters
- Split calculation accurate
- ZIP downloads correctly

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Large file blocks UI | Use Web Workers (Phase 06) |
| Invalid regex crashes | validatePattern() before use |
| Memory issues | Process one file at a time |

---

## Next Steps

→ Phase 05: Tab 2 - Merge & EPUB
