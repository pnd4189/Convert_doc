# Brainstorm Report: File Converter & Chapter Splitter App

**Date:** 2025-12-17
**Status:** Finalized

---

## 1. Problem Statement

Xây dựng web app xử lý file truyện với các chức năng:
- Convert TXT ↔ DOCX (batch 10 files, support >25MB)
- Đếm/tách chương theo số lượng tùy chọn, export ZIP
- Gộp nhiều file thành 1
- Convert sang EPUB

---

## 2. Requirements Confirmed

| Requirement | Decision |
|-------------|----------|
| Pattern nhận diện chương | Preset + Custom regex |
| Preview trước khi tách | Có |
| UI style | Step-by-step wizard |
| File naming | `[tên gốc]_chuong_001-012.txt` |
| EPUB metadata | Không cần |
| Language | Tiếng Việt |
| Progress bar | Có, detailed |

---

## 3. Architecture Decision

### Selected: Full Client-Side Processing

**Rationale:**
- File >25MB → server timeout là vấn đề (Vercel free = 10s)
- Privacy: file không rời máy user
- Cost: Free hosting đủ dùng
- Performance: Web Workers xử lý không block UI

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 APP                          │
├─────────────────────────────────────────────────────────────┤
│  [TAB 1] Chuyển đổi & Tách file                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Bước 1: Tải file lên (kéo thả, tối đa 10 file)        │  │
│  │ Bước 2: Chuyển TXT↔DOCX (tùy chọn, có thể bỏ qua)     │  │
│  │ Bước 3: Nhập pattern chương → Hiện số chương          │  │
│  │ Bước 4: Chọn số chương/file → Preview số file tách    │  │
│  │ Bước 5: Tải ZIP                                       │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  [TAB 2] Gộp file & EPUB                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Bước 1: Tải nhiều file (txt/doc/docx)                 │  │
│  │ Bước 2: Sắp xếp thứ tự (kéo thả)                      │  │
│  │ Bước 3: Xem trước nội dung gộp                        │  │
│  │ Bước 4: [Tải file gộp] hoặc [Chuyển sang EPUB]        │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      WEB WORKERS                            │
│              (Xử lý file lớn, không block UI)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Tech Stack

| Layer | Package | Version | Purpose |
|-------|---------|---------|---------|
| Framework | next | 16.0.10 | App Router, static export |
| UI | react | 19.2.3 | Latest with Actions |
| Styling | tailwindcss | 4.1.18 | Rapid UI development |
| DOCX Read | mammoth | 1.11.0 | DOCX → text extraction |
| DOCX Write | docx | 9.5.1 | Text → DOCX generation |
| ZIP | jszip | 3.10.1 | Bundle output files |
| EPUB | epub-gen-memory | 1.1.2 | Create EPUB client-side |
| Download | file-saver | 2.0.5 | Trigger file downloads |

---

## 5. Chapter Detection Strategy

### Preset Patterns (Vietnamese novels):
```javascript
const PRESET_PATTERNS = [
  { name: 'Chương X', pattern: /^Chương\s+\d+/im },
  { name: 'CHƯƠNG X', pattern: /^CHƯƠNG\s+\d+/im },
  { name: 'Chapter X', pattern: /^Chapter\s+\d+/im },
  { name: 'Hồi X', pattern: /^Hồi\s+\d+/im },
  { name: 'Quyển X Chương Y', pattern: /^Quyển\s+\d+.*Chương\s+\d+/im },
];
```

### Custom Pattern:
- User nhập regex string
- App validate và test trước khi apply
- Preview 3-5 chương đầu để xác nhận

---

## 6. File Processing Flow

### Tab 1: Convert & Split
```
Upload Files → [Convert?] → Detect Chapters → Config Split → Generate ZIP
     │              │              │               │              │
     ▼              ▼              ▼               ▼              ▼
  FileReader   mammoth/docx    regex.exec()   user input      JSZip
```

### Tab 2: Merge & EPUB
```
Upload Files → Reorder → Merge Content → [Download] or [→ EPUB]
     │            │            │              │            │
     ▼            ▼            ▼              ▼            ▼
 FileReader   drag-drop    concat text    file-saver  epub-gen
```

---

## 7. UI Components Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Tab container
│   └── globals.css
├── components/
│   ├── ui/                   # Shared UI (Button, Input, Progress...)
│   ├── tab-convert-split/    # Tab 1 components
│   │   ├── file-uploader.tsx
│   │   ├── convert-step.tsx
│   │   ├── chapter-detector.tsx
│   │   ├── split-config.tsx
│   │   └── download-zip.tsx
│   └── tab-merge-epub/       # Tab 2 components
│       ├── file-uploader.tsx
│       ├── file-reorder.tsx
│       ├── merge-preview.tsx
│       └── export-options.tsx
├── lib/
│   ├── file-processor.ts     # Core processing logic
│   ├── chapter-parser.ts     # Chapter detection
│   ├── docx-converter.ts     # DOCX handling
│   ├── epub-generator.ts     # EPUB creation
│   └── zip-builder.ts        # ZIP packaging
└── workers/
    └── file-worker.ts        # Web Worker for heavy tasks
```

---

## 8. Deployment

**Platform: Vercel (Recommended)**

| Reason | Detail |
|--------|--------|
| Static export | `next build && next export` → pure static |
| Free tier | Đủ cho app client-side |
| Custom domain | Free subdomain hoặc custom |
| CDN global | Fast load worldwide |
| Zero config | Auto deploy from Git |

**Hugging Face** không phù hợp vì:
- Thiết kế cho ML/AI demos
- Không cần Python backend
- Developer experience kém hơn cho web apps

---

## 9. Key Implementation Notes

### Large File Handling:
```javascript
// Use chunked reading for files > 10MB
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
async function readLargeFile(file) {
  // Read in chunks, process with Web Worker
}
```

### Progress Tracking:
```javascript
// Emit progress events for UI update
worker.postMessage({ type: 'PROCESS_FILE', file });
worker.onmessage = (e) => {
  if (e.data.type === 'PROGRESS') {
    setProgress(e.data.percent);
  }
};
```

### File Naming:
```javascript
// Pattern: [tên gốc]_chuong_XXX-YYY.txt
const fileName = `${baseName}_chuong_${startChapter.toString().padStart(3,'0')}-${endChapter.toString().padStart(3,'0')}.txt`;
```

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Browser memory limit với file rất lớn | Chunked processing, stream API |
| EPUB generation browser support | Fallback với epub-gen-memory |
| Regex performance với text lớn | Web Worker, optimize patterns |
| mammoth.js thiếu feature | Chỉ extract text, không cần full formatting |

---

## 11. Next Steps

1. **Init project:** `npx create-next-app@16.0.10 --typescript`
2. **Install dependencies:** mammoth, docx, jszip, epub-gen-memory, file-saver
3. **Setup Tailwind 4.x**
4. **Implement Tab 1:** Convert & Split wizard
5. **Implement Tab 2:** Merge & EPUB wizard
6. **Add Web Workers** cho file processing
7. **Test với file 25MB+**
8. **Deploy Vercel**

---

## 12. Unresolved Questions

None - Tất cả requirements đã được làm rõ.
