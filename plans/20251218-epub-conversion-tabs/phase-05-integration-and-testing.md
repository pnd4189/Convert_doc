# Phase 05: Integration and Testing

## Context Links
- Plan: [plan.md](./plan.md)
- Previous: [phase-04-doc-to-epub-tab.md](./phase-04-doc-to-epub-tab.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - High |
| Status | Pending |
| Description | Integrate new tabs into main app, add navigation, and comprehensive testing |

---

## Key Insights

1. Main app uses `Tabs` component from `@/components/ui/tabs`
2. Need to update main page to include 2 new tabs
3. Test with various file samples
4. Verify EPUB validity with e-readers

---

## Requirements

- Add tabs to main navigation
- Ensure consistent tab styling
- Test all conversion flows
- Verify batch processing (10 files)
- Test error handling

---

## Architecture

```
src/
├── app/
│   └── page.tsx             # UPDATE: Add new tabs
├── components/
│   ├── tab-epub-to-doc/     # NEW: Tab 1
│   ├── tab-doc-to-epub/     # NEW: Tab 2
│   ├── tab-convert-split/   # EXISTING
│   └── tab-merge-epub/      # EXISTING
```

---

## Related Code Files

| File | Purpose | Action |
|------|---------|--------|
| `src/app/page.tsx` | Main page with tabs | Update |
| `src/components/ui/tabs.tsx` | Tab component | Reference |
| All new components | New tabs | Verify imports |

---

## Implementation Steps

### Step 1: Update Main Page

```typescript
// src/app/page.tsx

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabConvertSplit } from '@/components/tab-convert-split';
import { TabMergeEpub } from '@/components/tab-merge-epub';
import { TabEpubToDoc } from '@/components/tab-epub-to-doc';
import { TabDocToEpub } from '@/components/tab-doc-to-epub';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">
        File Converter & Splitter
      </h1>

      <Tabs defaultValue="convert-split" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="convert-split">
            Chuyển đổi & Tách
          </TabsTrigger>
          <TabsTrigger value="merge-epub">
            Ghép EPUB
          </TabsTrigger>
          <TabsTrigger value="epub-to-doc">
            EPUB → Doc
          </TabsTrigger>
          <TabsTrigger value="doc-to-epub">
            Doc → EPUB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="convert-split">
          <TabConvertSplit />
        </TabsContent>

        <TabsContent value="merge-epub">
          <TabMergeEpub />
        </TabsContent>

        <TabsContent value="epub-to-doc">
          <TabEpubToDoc />
        </TabsContent>

        <TabsContent value="doc-to-epub">
          <TabDocToEpub />
        </TabsContent>
      </Tabs>
    </main>
  );
}
```

### Step 2: Create Test Files

Create sample files for testing in `test-files/` directory:

```
test-files/
├── epub/
│   ├── simple-book.epub      # Simple EPUB with 3 chapters
│   ├── complex-book.epub     # EPUB with tables, lists
│   └── large-book.epub       # Large EPUB (50+ chapters)
├── docx/
│   ├── simple.docx           # Simple document
│   ├── formatted.docx        # With headings, bold, lists
│   └── large.docx            # Large document
└── txt/
    ├── plain.txt             # Plain text
    ├── markdown.txt          # Markdown formatted
    └── chapters.txt          # With chapter patterns
```

### Step 3: Unit Tests for epub-reader

```typescript
// src/lib/epub-reader/epub-parser.test.ts

import { describe, it, expect } from 'vitest';
import { parseEpub } from './epub-parser';

describe('epub-parser', () => {
  it('should parse valid EPUB and extract chapters', async () => {
    // Create mock EPUB file with JSZip
    // Test extraction of title, author, chapters
  });

  it('should throw on invalid EPUB (missing container.xml)', async () => {
    // Test error handling
  });

  it('should handle EPUB 2 and EPUB 3', async () => {
    // Test both versions
  });
});
```

```typescript
// src/lib/epub-reader/xhtml-to-docx.test.ts

import { describe, it, expect } from 'vitest';
import { xhtmlToDocxElements } from './xhtml-to-docx';

describe('xhtml-to-docx', () => {
  it('should convert headings correctly', () => {
    const xhtml = '<h1>Title</h1><h2>Subtitle</h2>';
    const elements = xhtmlToDocxElements(xhtml);
    expect(elements.length).toBe(2);
  });

  it('should preserve bold and italic', () => {
    const xhtml = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const elements = xhtmlToDocxElements(xhtml);
    // Verify TextRun properties
  });

  it('should handle lists', () => {
    const xhtml = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const elements = xhtmlToDocxElements(xhtml);
    expect(elements.length).toBe(2);
  });

  it('should handle tables', () => {
    const xhtml = '<table><tr><td>A</td><td>B</td></tr></table>';
    const elements = xhtmlToDocxElements(xhtml);
    expect(elements.length).toBe(1);
  });
});
```

```typescript
// src/lib/epub-reader/xhtml-to-markdown.test.ts

import { describe, it, expect } from 'vitest';
import { xhtmlToMarkdown } from './xhtml-to-markdown';

describe('xhtml-to-markdown', () => {
  it('should convert headings to # syntax', () => {
    const xhtml = '<h1>Title</h1><h2>Subtitle</h2>';
    const md = xhtmlToMarkdown(xhtml);
    expect(md).toContain('# Title');
    expect(md).toContain('## Subtitle');
  });

  it('should convert bold to **', () => {
    const xhtml = '<p><strong>Bold text</strong></p>';
    const md = xhtmlToMarkdown(xhtml);
    expect(md).toContain('**Bold text**');
  });

  it('should convert lists correctly', () => {
    const xhtml = '<ul><li>Item</li></ul>';
    const md = xhtmlToMarkdown(xhtml);
    expect(md).toContain('- Item');
  });
});
```

### Step 4: Unit Tests for doc-to-epub

```typescript
// src/lib/doc-to-epub/txt-processor.test.ts

import { describe, it, expect } from 'vitest';
import { processTxt } from './txt-processor';

describe('txt-processor', () => {
  it('should detect Markdown content', async () => {
    const content = '# Heading\n\n**Bold** text';
    const file = new File([content], 'test.txt');
    const result = await processTxt(file);
    expect(result.isMarkdown).toBe(true);
  });

  it('should process plain text', async () => {
    const content = 'Simple paragraph.\n\nAnother paragraph.';
    const file = new File([content], 'test.txt');
    const result = await processTxt(file);
    expect(result.isMarkdown).toBe(false);
    expect(result.html).toContain('<p>');
  });
});
```

### Step 5: Integration Tests

```typescript
// src/lib/epub-reader/index.test.ts

import { describe, it, expect } from 'vitest';
import { convertEpubToDocx, convertEpubToMarkdown } from './index';

describe('epub-reader integration', () => {
  it('should convert EPUB to DOCX', async () => {
    // Use real sample EPUB file
    // Verify output is valid DOCX blob
  });

  it('should convert EPUB to Markdown', async () => {
    // Use real sample EPUB file
    // Verify output contains Markdown syntax
  });

  it('should handle batch conversion', async () => {
    // Test with multiple files
  });
});
```

### Step 6: E2E Testing Checklist

Manual testing checklist:

**Tab 1: EPUB to DOCX/TXT**
- [ ] Upload single EPUB → DOCX works
- [ ] Upload single EPUB → TXT works
- [ ] Batch 5 EPUB files → DOCX works
- [ ] Batch 10 EPUB files → no crash
- [ ] Progress bar updates correctly
- [ ] Download single file works
- [ ] Download ZIP for batch works
- [ ] Reset button clears state
- [ ] Back navigation works

**Tab 2: DOCX/TXT to EPUB**
- [ ] Upload single DOCX → EPUB works
- [ ] Upload single TXT (Markdown) → EPUB works
- [ ] Upload plain TXT → EPUB works
- [ ] Metadata form validates title
- [ ] Cover image upload and preview works
- [ ] Chapter detection finds chapters
- [ ] Chapter reorder works
- [ ] Chapter removal works
- [ ] Preview shows correct summary
- [ ] EPUB download works
- [ ] Generated EPUB opens in Calibre
- [ ] Generated EPUB opens in Apple Books
- [ ] Reset button clears state

**General**
- [ ] Tab navigation smooth
- [ ] Stepper click-to-go-back works
- [ ] Error messages display properly
- [ ] Mobile responsive

---

## Todo List

- [ ] Update `src/app/page.tsx` with new tabs
- [ ] Verify all imports resolve correctly
- [ ] Create test sample files
- [ ] Write unit tests for epub-reader
- [ ] Write unit tests for doc-to-epub
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no warnings
- [ ] Manual E2E testing
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Performance check with large files

---

## Success Criteria

1. All 4 tabs visible and accessible
2. All unit tests pass
3. Build succeeds without errors
4. E2E checklist complete
5. Generated EPUBs valid in e-readers
6. No console errors during operation

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Import path errors | High | Check all paths before build |
| Missing dependency | High | npm install before build |
| Styling conflicts | Low | Use existing Tailwind classes |
| Large file timeout | Medium | Add loading states |

---

## Security Considerations

- All processing client-side
- No data sent to server
- File validation in place

---

## Unresolved Questions

None at this phase - all requirements clarified in brainstorm.

---

## Completion Checklist

After all phases complete:

1. [ ] Run full test suite: `npm run test`
2. [ ] Build for production: `npm run build`
3. [ ] Test production build: `npm start`
4. [ ] Update README with new features
5. [ ] Create sample usage GIF/screenshots
