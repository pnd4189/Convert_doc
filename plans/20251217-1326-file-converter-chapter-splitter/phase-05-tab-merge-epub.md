# Phase 05: Tab 2 - Merge & EPUB

**Parent:** [plan.md](./plan.md)
**Depends on:** Phase 02, Phase 03
**Status:** Pending
**Priority:** High

---

## Overview

Implement Tab 2 wizard: Upload multiple files → Reorder → Preview → Download merged OR convert to EPUB.

---

## User Flow

```
Bước 1: Tải nhiều file (txt/doc/docx)
         ↓
Bước 2: Sắp xếp thứ tự (kéo thả)
         ↓
Bước 3: Xem trước nội dung gộp
         ↓
Bước 4: [Tải file gộp] hoặc [Chuyển sang EPUB]
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/tab-merge-epub/index.tsx` | Main container |
| `src/components/tab-merge-epub/step-upload.tsx` | Step 1 |
| `src/components/tab-merge-epub/step-reorder.tsx` | Step 2 |
| `src/components/tab-merge-epub/step-preview.tsx` | Step 3 |
| `src/components/tab-merge-epub/step-export.tsx` | Step 4 |

---

## Implementation Steps

### Step 1: index.tsx (Container)

```typescript
const STEPS = [
  { id: 'upload', title: 'Tải file lên' },
  { id: 'reorder', title: 'Sắp xếp' },
  { id: 'preview', title: 'Xem trước' },
  { id: 'export', title: 'Xuất file' },
];

interface TabState {
  files: FileInfo[];
  mergedContent: string;
  currentStep: number;
}

export function TabMergeEpub();
```

### Step 2: step-upload.tsx

Same as Tab 1 upload, reuse FileDropzone.

```typescript
interface StepUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onNext: () => void;
}
```

### Step 3: step-reorder.tsx

Features:
- Drag & drop list to reorder
- Show file name + size
- Move up/down buttons as fallback
- Remove file button

```typescript
interface StepReorderProps {
  files: FileInfo[];
  onReorder: (files: FileInfo[]) => void;
  onNext: () => void;
  onBack: () => void;
}
```

UI Layout:
```
┌─────────────────────────────────────────────┐
│ Sắp xếp thứ tự file:                        │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ≡ 1. chuong-01-10.txt (125KB)    [↑][↓][×]│
│ │ ≡ 2. chuong-11-20.txt (130KB)    [↑][↓][×]│
│ │ ≡ 3. chuong-21-30.txt (128KB)    [↑][↓][×]│
│ └─────────────────────────────────────────┘ │
│                                             │
│ Kéo thả để sắp xếp lại                      │
│                                             │
│ [← Quay lại]              [Tiếp tục →]      │
└─────────────────────────────────────────────┘
```

Drag & drop implementation:
- Use native HTML5 drag & drop
- Or simple state-based reorder with buttons

### Step 4: step-preview.tsx

Features:
- Show merged content preview (first 1000 chars)
- Total character/word count
- Scroll preview area

```typescript
interface StepPreviewProps {
  mergedContent: string;
  onNext: () => void;
  onBack: () => void;
}
```

### Step 5: step-export.tsx

Features:
- Two buttons: "Tải file TXT" / "Chuyển sang EPUB"
- Progress bar during processing
- File name input (optional)
- Download triggers

```typescript
interface StepExportProps {
  content: string;
  defaultName: string;
  onReset: () => void;
}
```

UI Layout:
```
┌─────────────────────────────────────────────┐
│ Xuất file:                                  │
│                                             │
│ Tên file: [merged-novel          ]          │
│                                             │
│ ┌───────────────┐  ┌───────────────┐        │
│ │               │  │               │        │
│ │  📄 TXT       │  │  📚 EPUB      │        │
│ │               │  │               │        │
│ │ [Tải về]      │  │ [Chuyển đổi]  │        │
│ └───────────────┘  └───────────────┘        │
│                                             │
│ [← Quay lại]              [Làm lại]         │
└─────────────────────────────────────────────┘
```

---

## State Flow

```
files → read content → FileInfo[]
                           ↓
                    reorder → mergeFiles → mergedContent
                                              ↓
                                   [TXT download] OR [generateEpub → download]
```

---

## Todo List

- [ ] Create index.tsx với stepper state
- [ ] Implement step-upload.tsx (reuse from Tab 1)
- [ ] Implement step-reorder.tsx với drag & drop
- [ ] Implement step-preview.tsx
- [ ] Implement step-export.tsx với dual options
- [ ] Wire up state management
- [ ] Add loading states
- [ ] Add error handling

---

## Success Criteria

- Multiple file upload works
- Reorder changes merged output order
- Preview shows merged content
- TXT download works
- EPUB download works

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Drag & drop browser compat | Fallback to button controls |
| EPUB generation fails | Try-catch with error message |
| Large merged content | Truncate preview |

---

## Next Steps

→ Phase 06: Web Workers Integration
