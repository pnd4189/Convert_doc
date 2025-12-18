# Testing Checklist - EPUB Conversion Tabs

**Date:** 2024-12-18
**Status:** Ready for Manual Testing
**Build Status:** ✅ Passed (0 warnings, 0 errors) - **CLEAN BUILD**

---

## Summary

All 4 phases (1-4) completed. Integration verified. Ready for manual E2E testing.

---

## Build Verification

- ✅ TypeScript compilation: `npx tsc --noEmit` - **No errors**
- ✅ Production build: `npm run build` - **Success**
- ✅ ESLint: `npm run lint` - **0 warnings, 0 errors** ✨

### Code Quality Fixes Applied:
1. ✅ Suppressed `@next/next/no-img-element` in step-metadata.tsx (data URL preview)
2. ✅ Suppressed `@next/next/no-img-element` in step-export.tsx (data URL preview)
3. ✅ Removed unused `filename` parameter from `textToDocx()` function
4. ✅ Removed unused `EpubXhtmlChapter` import from epub-reader/index.ts
5. ✅ Removed unused `Document` import from epub-reader/xhtml-to-docx.ts

---

## Tab Integration

| Tab ID | Label | Component | Status |
|--------|-------|-----------|--------|
| convert-split | Chuyển đổi & Tách file | TabConvertSplit | ✅ Existing |
| merge-epub | Gộp file & EPUB | TabMergeEpub | ✅ Existing |
| epub-to-doc | EPUB sang DOCX/TXT | TabEpubToDoc | ✅ New - Phase 2 |
| doc-to-epub | DOCX/TXT sang EPUB | TabDocToEpub | ✅ New - Phase 4 |

---

## Manual Testing Checklist

### Tab 1: EPUB to DOCX/TXT

**Basic Functionality:**
- [ ] Upload single EPUB → DOCX conversion works
- [ ] Upload single EPUB → TXT conversion works
- [ ] DOCX output preserves headings (H1-H6)
- [ ] DOCX output preserves bold/italic formatting
- [ ] TXT output uses Markdown syntax
- [ ] File download works (single file)

**Batch Processing:**
- [ ] Upload 5 EPUB files → DOCX conversion
- [ ] Upload 10 EPUB files (max limit)
- [ ] Progress bar updates correctly
- [ ] Download ZIP for batch files works
- [ ] No browser freeze with large files

**Navigation:**
- [ ] Step 1 → Step 2 navigation
- [ ] Step 2 → Step 3 navigation
- [ ] Back button works
- [ ] Stepper click-to-go-back works
- [ ] Reset button clears all state

**Error Handling:**
- [ ] Invalid EPUB shows error message
- [ ] Empty file shows error
- [ ] Corrupt EPUB handled gracefully

---

### Tab 2: DOCX/TXT to EPUB

**Basic Functionality:**
- [ ] Upload single DOCX → EPUB conversion works
- [ ] Upload single TXT (Markdown) → EPUB works
- [ ] Upload plain TXT → EPUB works
- [ ] Auto-fill title from filename works
- [ ] Metadata form validates required fields
- [ ] EPUB download works

**Metadata & Cover:**
- [ ] Title field required validation
- [ ] Author/translator optional fields work
- [ ] Cover image upload works
- [ ] Cover preview displays correctly
- [ ] Cover included in final EPUB

**Chapter Management:**
- [ ] Chapter detection runs automatically
- [ ] Detected chapters displayed in list
- [ ] Move chapter up (↑) works
- [ ] Move chapter down (↓) works
- [ ] Remove chapter (×) works
- [ ] Re-indexing after reorder correct
- [ ] Empty chapters list shows warning

**Preview & Export:**
- [ ] Preview shows correct metadata
- [ ] Preview shows chapter count
- [ ] Preview shows table of contents
- [ ] Preview shows total character count
- [ ] EPUB generation shows progress
- [ ] Generated EPUB downloads successfully

**EPUB Validation:**
- [ ] Generated EPUB opens in Calibre
- [ ] Generated EPUB opens in Apple Books
- [ ] Generated EPUB opens in Adobe Digital Editions
- [ ] Table of contents navigation works
- [ ] Cover image displays in e-reader
- [ ] Metadata correct in e-reader

**Navigation:**
- [ ] All 5 steps flow correctly
- [ ] Back button works at each step
- [ ] Stepper click-to-go-back works
- [ ] Reset button clears all state

**Error Handling:**
- [ ] Invalid DOCX shows error message
- [ ] Unsupported file type rejected
- [ ] Empty file handled gracefully
- [ ] Chapter detection failure handled

---

## Cross-Tab Testing

**General UI:**
- [ ] Tab switching smooth (no flicker)
- [ ] Tab content isolated (no state bleed)
- [ ] Consistent styling across tabs
- [ ] Responsive layout on mobile
- [ ] Responsive layout on tablet

**Performance:**
- [ ] Large EPUB (10MB+) conversion completes
- [ ] Large DOCX (5MB+) conversion completes
- [ ] Batch 10 files no memory leak
- [ ] UI remains responsive during conversion

**Browser Compatibility:**
- [ ] Chrome/Edge (Chromium) - Windows
- [ ] Firefox - Windows
- [ ] Safari - macOS (if available)
- [ ] Mobile browser (Chrome/Safari)

---

## Known Limitations

1. **File Size:** Browser memory limits apply (~100MB per file)
2. **Batch Limit:** Max 10 files per batch
3. **Image Support:** Cover images only (no inline images in content)
4. **EPUB Version:** Generates EPUB 3.0

---

## Next Steps

1. Perform manual E2E testing using checklist above
2. Create sample test files for each scenario
3. Document any bugs found
4. Create user guide with screenshots

---

## Test Files Needed

Create these sample files for testing:

### EPUB Files:
- `simple-book.epub` - 3 chapters, basic text
- `formatted-book.epub` - With bold, italic, lists, tables
- `large-book.epub` - 50+ chapters

### DOCX Files:
- `simple.docx` - Basic text with headings
- `formatted.docx` - With styles, lists, tables
- `chapters.docx` - Multiple Heading 1 elements

### TXT Files:
- `plain.txt` - Plain text paragraphs
- `markdown.txt` - Markdown formatted (# headers, **bold**)
- `chapters.txt` - With "Chương" patterns

---

## Success Criteria

✅ All builds pass
⏳ Manual E2E checklist complete
⏳ EPUB validation in 2+ e-readers
⏳ No critical bugs found
⏳ User documentation created
