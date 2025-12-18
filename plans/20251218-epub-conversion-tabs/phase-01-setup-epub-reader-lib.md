# Phase 01: Setup EPUB Reader Library

## Context Links
- Plan: [plan.md](./plan.md)
- Brainstorm: [brainstorm-20251218-epub-conversion-tabs.md](../reports/brainstorm-20251218-epub-conversion-tabs.md)
- Next: [phase-02-epub-to-docx-txt-tab.md](./phase-02-epub-to-docx-txt-tab.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | Completed (2024-12-18) |
| Description | Create epub-reader lib to parse EPUB files and convert XHTML content to DOCX/Markdown |

---

## Key Insights

1. EPUB = ZIP with specific structure (mimetype, META-INF, OEBPS)
2. `content.opf` contains spine order (reading sequence)
3. Browser DOMParser handles XHTML parsing natively
4. `docx` lib already in project - reuse for DOCX generation

---

## Requirements

- Parse EPUB 2 and EPUB 3 formats
- Extract text content in spine order
- Convert to DOCX with: h1-h6, bold, italic, lists, tables
- Convert to Markdown TXT with same elements
- Handle multiple XHTML files per EPUB
- Ignore images (per brainstorm decision)

---

## Architecture

```
src/lib/epub-reader/
├── index.ts              # Main entry: extractEpubContent(), convertEpubToDocx(), convertEpubToMarkdown()
├── epub-parser.ts        # parseEpub() - extract content.opf, get spine files, read XHTML
├── xhtml-to-docx.ts      # xhtmlToDocxElements() - DOM → docx Paragraph/TextRun/Table
└── xhtml-to-markdown.ts  # xhtmlToMarkdown() - DOM → Markdown string
```

### Type Definitions

```typescript
// epub-parser.ts
interface EpubContent {
  title: string;
  author?: string;
  chapters: EpubXhtmlChapter[];
}

interface EpubXhtmlChapter {
  id: string;
  href: string;
  content: string; // raw XHTML
}

// index.ts
interface ConvertResult {
  filename: string;
  blob: Blob;
}
```

---

## Related Code Files

| File | Purpose | Reuse |
|------|---------|-------|
| `src/lib/epub/types.ts` | Existing types | Reference patterns |
| `src/lib/epub/utils.ts` | textToHtml, generateUUID | May reference |
| `package.json` | deps: jszip, docx | Use directly |

---

## Implementation Steps

### Step 1: Create epub-parser.ts

```typescript
// src/lib/epub-reader/epub-parser.ts

import JSZip from 'jszip';

export interface EpubXhtmlChapter {
  id: string;
  href: string;
  content: string;
}

export interface EpubContent {
  title: string;
  author?: string;
  chapters: EpubXhtmlChapter[];
}

/**
 * Parse EPUB file and extract content in reading order
 */
export async function parseEpub(file: File): Promise<EpubContent> {
  const zip = await JSZip.loadAsync(file);

  // 1. Read META-INF/container.xml to find content.opf path
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) throw new Error('Invalid EPUB: missing container.xml');

  const containerDoc = new DOMParser().parseFromString(containerXml, 'application/xml');
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootfilePath) throw new Error('Invalid EPUB: missing rootfile path');

  // 2. Parse content.opf
  const opfContent = await zip.file(rootfilePath)?.async('string');
  if (!opfContent) throw new Error('Invalid EPUB: missing content.opf');

  const opfDoc = new DOMParser().parseFromString(opfContent, 'application/xml');
  const opfDir = rootfilePath.includes('/') ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) : '';

  // 3. Get metadata
  const title = opfDoc.querySelector('metadata title')?.textContent || 'Untitled';
  const author = opfDoc.querySelector('metadata creator')?.textContent || undefined;

  // 4. Build manifest map (id → href)
  const manifest = new Map<string, string>();
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) manifest.set(id, href);
  });

  // 5. Get spine order (itemref idref)
  const spineRefs: string[] = [];
  opfDoc.querySelectorAll('spine itemref').forEach(ref => {
    const idref = ref.getAttribute('idref');
    if (idref) spineRefs.push(idref);
  });

  // 6. Read XHTML files in spine order
  const chapters: EpubXhtmlChapter[] = [];
  for (const idref of spineRefs) {
    const href = manifest.get(idref);
    if (!href) continue;

    const filePath = opfDir + href;
    const xhtmlContent = await zip.file(filePath)?.async('string');
    if (xhtmlContent) {
      chapters.push({ id: idref, href, content: xhtmlContent });
    }
  }

  return { title, author, chapters };
}
```

### Step 2: Create xhtml-to-docx.ts

```typescript
// src/lib/epub-reader/xhtml-to-docx.ts

import {
  Document, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle
} from 'docx';

type DocxElement = Paragraph | Table;

/**
 * Convert XHTML string to docx elements
 */
export function xhtmlToDocxElements(xhtml: string): DocxElement[] {
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const body = doc.querySelector('body') || doc.documentElement;

  const elements: DocxElement[] = [];
  processNode(body, elements);
  return elements;
}

function processNode(node: Node, elements: DocxElement[]): void {
  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) {
        elements.push(new Paragraph({ children: [new TextRun(text)] }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      switch (tag) {
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
          elements.push(createHeading(el, tag));
          break;
        case 'p':
          elements.push(createParagraph(el));
          break;
        case 'ul': case 'ol':
          createList(el, tag === 'ol', elements);
          break;
        case 'table':
          elements.push(createTable(el));
          break;
        case 'div': case 'section': case 'article':
          processNode(el, elements);
          break;
        // Skip: img, figure, svg, etc.
      }
    }
  });
}

function createHeading(el: Element, tag: string): Paragraph {
  const level = parseInt(tag.charAt(1)) as 1|2|3|4|5|6;
  const headingMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  return new Paragraph({
    heading: headingMap[level],
    children: extractTextRuns(el),
  });
}

function createParagraph(el: Element): Paragraph {
  return new Paragraph({ children: extractTextRuns(el) });
}

function extractTextRuns(el: Element): TextRun[] {
  const runs: TextRun[] = [];
  traverseForRuns(el, runs, { bold: false, italic: false });
  return runs;
}

function traverseForRuns(node: Node, runs: TextRun[], style: { bold: boolean; italic: boolean }): void {
  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) {
        runs.push(new TextRun({ text, bold: style.bold, italics: style.italic }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      const newStyle = { ...style };

      if (tag === 'strong' || tag === 'b') newStyle.bold = true;
      if (tag === 'em' || tag === 'i') newStyle.italic = true;

      traverseForRuns(el, runs, newStyle);
    }
  });
}

function createList(el: Element, numbered: boolean, elements: DocxElement[]): void {
  el.querySelectorAll(':scope > li').forEach((li, index) => {
    const prefix = numbered ? `${index + 1}. ` : '• ';
    const text = li.textContent?.trim() || '';
    elements.push(new Paragraph({
      children: [new TextRun(prefix + text)],
    }));
  });
}

function createTable(el: Element): Table {
  const rows: TableRow[] = [];
  el.querySelectorAll('tr').forEach(tr => {
    const cells: TableCell[] = [];
    tr.querySelectorAll('td, th').forEach(td => {
      cells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun(td.textContent?.trim() || '')] })],
      }));
    });
    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
```

### Step 3: Create xhtml-to-markdown.ts

```typescript
// src/lib/epub-reader/xhtml-to-markdown.ts

/**
 * Convert XHTML string to Markdown
 */
export function xhtmlToMarkdown(xhtml: string): string {
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const body = doc.querySelector('body') || doc.documentElement;

  return processNodeToMd(body).trim();
}

function processNodeToMd(node: Node): string {
  let result = '';

  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      result += elementToMd(el);
    }
  });

  return result;
}

function elementToMd(el: Element): string {
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'h1': return `\n# ${el.textContent?.trim()}\n\n`;
    case 'h2': return `\n## ${el.textContent?.trim()}\n\n`;
    case 'h3': return `\n### ${el.textContent?.trim()}\n\n`;
    case 'h4': return `\n#### ${el.textContent?.trim()}\n\n`;
    case 'h5': return `\n##### ${el.textContent?.trim()}\n\n`;
    case 'h6': return `\n###### ${el.textContent?.trim()}\n\n`;
    case 'p': return `${processInline(el)}\n\n`;
    case 'br': return '\n';
    case 'strong': case 'b': return `**${processNodeToMd(el)}**`;
    case 'em': case 'i': return `*${processNodeToMd(el)}*`;
    case 'a':
      const href = el.getAttribute('href') || '';
      return `[${el.textContent}](${href})`;
    case 'ul': return processListToMd(el, false);
    case 'ol': return processListToMd(el, true);
    case 'li': return el.textContent?.trim() || '';
    case 'table': return processTableToMd(el);
    case 'div': case 'section': case 'article': case 'span':
      return processNodeToMd(el);
    default:
      return processNodeToMd(el);
  }
}

function processInline(el: Element): string {
  let result = '';
  el.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      result += elementToMd(child as Element);
    }
  });
  return result;
}

function processListToMd(el: Element, numbered: boolean): string {
  let result = '\n';
  el.querySelectorAll(':scope > li').forEach((li, i) => {
    const prefix = numbered ? `${i + 1}. ` : '- ';
    result += `${prefix}${li.textContent?.trim()}\n`;
  });
  return result + '\n';
}

function processTableToMd(el: Element): string {
  const rows = el.querySelectorAll('tr');
  if (rows.length === 0) return '';

  let result = '\n';
  let isFirst = true;

  rows.forEach(row => {
    const cells = row.querySelectorAll('td, th');
    const cellTexts = Array.from(cells).map(c => c.textContent?.trim() || '');
    result += `| ${cellTexts.join(' | ')} |\n`;

    if (isFirst && cells.length > 0) {
      result += `| ${cellTexts.map(() => '---').join(' | ')} |\n`;
      isFirst = false;
    }
  });

  return result + '\n';
}
```

### Step 4: Create index.ts (Orchestrator)

```typescript
// src/lib/epub-reader/index.ts

import { Document, Packer } from 'docx';
import { parseEpub, EpubContent } from './epub-parser';
import { xhtmlToDocxElements } from './xhtml-to-docx';
import { xhtmlToMarkdown } from './xhtml-to-markdown';

export type { EpubContent, EpubXhtmlChapter } from './epub-parser';

export interface ConvertResult {
  filename: string;
  blob: Blob;
}

/**
 * Extract and convert EPUB to DOCX
 */
export async function convertEpubToDocx(file: File): Promise<ConvertResult> {
  const epub = await parseEpub(file);

  // Combine all chapters' XHTML into docx elements
  const allElements = epub.chapters.flatMap(ch => xhtmlToDocxElements(ch.content));

  const doc = new Document({
    title: epub.title,
    creator: epub.author,
    sections: [{
      children: allElements,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = file.name.replace(/\.epub$/i, '.docx');

  return { filename, blob };
}

/**
 * Extract and convert EPUB to Markdown TXT
 */
export async function convertEpubToMarkdown(file: File): Promise<ConvertResult> {
  const epub = await parseEpub(file);

  // Combine all chapters' XHTML into markdown
  const markdown = epub.chapters
    .map(ch => xhtmlToMarkdown(ch.content))
    .join('\n\n---\n\n');

  const blob = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
  const filename = file.name.replace(/\.epub$/i, '.txt');

  return { filename, blob };
}

/**
 * Batch convert multiple EPUB files
 */
export async function batchConvertEpub(
  files: File[],
  format: 'docx' | 'txt'
): Promise<ConvertResult[]> {
  const results: ConvertResult[] = [];
  const converter = format === 'docx' ? convertEpubToDocx : convertEpubToMarkdown;

  for (const file of files) {
    try {
      const result = await converter(file);
      results.push(result);
    } catch (error) {
      console.error(`Failed to convert ${file.name}:`, error);
      // Continue with other files
    }
  }

  return results;
}
```

---

## Todo List

- [x] Create `src/lib/epub-reader/` directory
- [x] Implement `epub-parser.ts` - EPUB extraction
- [x] Implement `xhtml-to-docx.ts` - DOCX conversion
- [x] Implement `xhtml-to-markdown.ts` - Markdown conversion
- [x] Implement `index.ts` - Orchestrator with batch support
- [x] Add unit tests for each converter
- [x] Test with sample EPUB files

---

## Success Criteria

1. `parseEpub()` extracts title, author, chapters from valid EPUB
2. `convertEpubToDocx()` produces valid DOCX with preserved formatting
3. `convertEpubToMarkdown()` produces readable Markdown
4. Batch processing handles 10 files without crash
5. Error handling for invalid EPUB files

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex EPUB with nested TOC | Medium | Start with flat reading order (spine) |
| XHTML parsing errors | Low | Try/catch per chapter, skip broken |
| Large file memory | Medium | Process chapters sequentially |
| Non-standard EPUB structure | Low | Validate container.xml presence |

---

## Security Considerations

- Validate file is actual EPUB (check mimetype file)
- Sanitize extracted content before display
- No server-side processing, all browser-based

---

## Next Steps

After completion, proceed to [Phase 02: EPUB to DOCX/TXT Tab](./phase-02-epub-to-docx-txt-tab.md)
