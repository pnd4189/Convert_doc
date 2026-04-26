# Convert_doc

Cong cu chuyen doi file tai lieu truyen - 100% xu ly tren trinh duyet, khong can server.

Ho tro: TXT, DOCX, EPUB.

## Cong nghe

| Thu vien | Muc dich |
|----------|----------|
| Next.js 16 + React 19 | UI framework |
| TypeScript | Static typing |
| Tailwind CSS 4 | Styling |
| jszip | ZIP/EPUB creation |
| mammoth | DOCX reading |
| docx | DOCX writing |
| marked | Markdown parsing |
| file-saver | Browser download |
| vitest | Testing |

## Cac chuc nang (4 Tab)

### 1. Chuyen doi & Tach file
Upload TXT/DOCX -> nhan dien chuong bang regex -> tach thanh nhieu file -> tai ve ZIP.

### 2. Gop file & EPUB
Upload TXT/DOCX -> sap xep lai -> gop lai -> xuat ra TXT hoac EPUB.

### 3. EPUB sang DOCX/TXT
Upload EPUB -> chuyen doi sang DOCX hoac Markdown -> tai ve.

### 4. DOCX/TXT sang EPUB
Upload -> nhap metadata + anh bia + font -> nhan dien/loc chuong -> xem truoc -> xuat EPUB.

## Cai dat & Chay

```bash
npm install
npm run dev        # Development server
npm run build      # Production build (static export)
npm run lint       # ESLint
npx vitest run     # Run tests
```

Build output la static export (`output: 'export'`) — khong can Node.js server.

## Cau truc du an

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Vietnamese lang)
│   └── page.tsx            # Main page with 4 tabs
├── components/
│   ├── tab-convert-split/  # Tab 1: Convert & Split (5 steps)
│   ├── tab-merge-epub/     # Tab 2: Merge & EPUB (4 steps)
│   ├── tab-epub-to-doc/    # Tab 3: EPUB to DOCX/TXT (4 steps)
│   ├── tab-doc-to-epub/    # Tab 4: DOCX/TXT to EPUB (5 steps)
│   └── ui/                 # Shared UI components
└── lib/
    ├── chapter-parser.ts   # 24 preset patterns, line/position detection
    ├── docx-converter.ts   # DOCX <-> text conversion
    ├── file-processor.ts   # High-level file read/split/merge
    ├── zip-builder.ts      # ZIP create/extract via JSZip
    ├── epub/               # EPUB 3.0 generation engine (8 files)
    ├── epub-reader/        # EPUB parsing + converters (4 files)
    └── doc-to-epub/        # DOCX/TXT-to-EPUB orchestrator (3 files)
```

## Kien truc

Toan bo xu ly发生在 trinh duyet:
- File upload qua FileDropzone -> FileReader/ArrayBuffer
- Text processing qua mammoth (DOCX), TextDecoder (encoding), marked (Markdown)
- Chapter detection qua regex patterns (24 preset cho VN/CN/EN)
- EPUB generation qua JSZip hand-crafted XML templates
- Download qua file-saver

Khong co server upload. File khong roi khoi trinh duyet cua nguoi dung.

## Testing

4 test files, 34 tests voi vitest:
- `chapter-parser.test.ts` — Position-based va line-based detection, edge cases
- `epub/chapter-builder.test.ts` — Chapter XHTML building
- `epub/cover.test.ts` — Cover template generation
- `epub/toc.test.ts` — OPF, NCX, TOC templates

## Tai lieu

Xem thu muc `docs/` de biet them chi tiet:
- [Huong dan su dung](./docs/usage-guide.md)
- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Code Standards](./docs/code-standards.md)
- [System Architecture](./docs/system-architecture.md)
- [Project Roadmap](./docs/project-roadmap.md)
