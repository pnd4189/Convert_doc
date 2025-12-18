# Changelog

## 2024-12-18
- **Code Quality Improvements** completed.
  - Fixed all ESLint warnings (5 → 0).
  - Suppressed `@next/next/no-img-element` warnings for cover preview images (data URLs).
  - Removed unused `filename` parameter from `textToDocx()` function.
  - Removed unused `EpubXhtmlChapter` import from epub-reader/index.ts.
  - Removed unused `Document` import from epub-reader/xhtml-to-docx.ts.
  - Build status: ✅ **0 errors, 0 warnings**.

- **EPUB Conversion Tabs - Phase 5: Integration and Testing** completed.
  - Verified all 4 tabs integrated in main app.
  - TypeScript build passed (0 errors).
  - Production build passed successfully.
  - ESLint passed (5 non-blocking warnings).
  - Created comprehensive testing checklist in `plans/reports/testing-checklist-20241218.md`.
  - Ready for manual E2E testing and EPUB validation.

- **EPUB Conversion Tabs - Phase 4: DOCX/TXT to EPUB Tab UI** completed.
  - Implemented `src/components/tab-doc-to-epub/step-upload.tsx` for file upload (DOCX/TXT).
  - Implemented `src/components/tab-doc-to-epub/step-metadata.tsx` for metadata + cover image.
  - Implemented `src/components/tab-doc-to-epub/step-chapters.tsx` for chapter review/reorder.
  - Implemented `src/components/tab-doc-to-epub/step-preview.tsx` for final preview.
  - Implemented `src/components/tab-doc-to-epub/step-export.tsx` for EPUB generation.
  - Implemented `src/components/tab-doc-to-epub/index.tsx` as main tab container.
  - Registered new tab in `src/app/page.tsx` - "DOCX/TXT sang EPUB".

- **EPUB Conversion Tabs - Phase 3: Setup Doc-to-EPUB Library** completed.
  - Installed `marked` (v15.0.0) and `@types/marked` dependencies.
  - Implemented `src/lib/doc-to-epub/docx-processor.ts` for DOCX → HTML conversion.
  - Implemented `src/lib/doc-to-epub/txt-processor.ts` for TXT/Markdown → HTML with auto-detection.
  - Implemented `src/lib/doc-to-epub/index.ts` as orchestrator with batch conversion support.

- **EPUB Conversion Tabs - Phase 2: EPUB to DOCX/TXT Tab UI** completed.
  - Implemented `src/components/tab-epub-to-doc/index.tsx` as main tab container.
  - Implemented `src/components/tab-epub-to-doc/step-upload.tsx` for file upload (max 10 EPUBs).
  - Implemented `src/components/tab-epub-to-doc/step-configure.tsx` for output format selection.
  - Implemented `src/components/tab-epub-to-doc/step-convert.tsx` for conversion progress.
  - Implemented `src/components/tab-epub-to-doc/step-download.tsx` for download results.
  - Registered new tab in `src/app/page.tsx` - "EPUB sang DOCX/TXT".

- **EPUB Conversion Tabs - Phase 1: Setup EPUB Reader Library** completed.
  - Implemented `src/lib/epub-reader/epub-parser.ts` for EPUB extraction.
  - Implemented `src/lib/epub-reader/xhtml-to-docx.ts` for DOCX conversion.
  - Implemented `src/lib/epub-reader/xhtml-to-markdown.ts` for Markdown conversion.
  - Implemented `src/lib/epub-reader/index.ts` as the orchestrator with batch support.



## 2025-12-18
- **Phase 1: Modular Refactor** completed.
  - Extracted monolithic `epub-generator.ts` into a modular structure under `src/lib/epub/`.
  - Established `src/lib/epub/types.ts`, `utils.ts`, `templates.ts`, `styles.ts`, and `index.ts`.
  - Maintained backward compatibility for `generateEpub` and prepared for multi-chapter support.
