/**
 * XHTML to DOCX Converter
 * Converts XHTML content to docx library elements with formatting preservation
 */

import {
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';

type DocxElement = Paragraph | Table;

interface TextStyle {
  bold: boolean;
  italic: boolean;
}

/**
 * Convert XHTML string to array of docx elements
 * @param xhtml - XHTML content string
 * @returns Array of Paragraph and Table elements
 */
export function xhtmlToDocxElements(xhtml: string): DocxElement[] {
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const body = doc.querySelector('body') || doc.documentElement;

  const elements: DocxElement[] = [];
  processNode(body, elements);
  return elements;
}

/**
 * Process DOM node and extract docx elements
 */
function processNode(node: Node, elements: DocxElement[]): void {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) {
        elements.push(new Paragraph({ children: [new TextRun(text)] }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      switch (tag) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          elements.push(createHeading(el, tag));
          break;
        case 'p':
          elements.push(createParagraph(el));
          break;
        case 'ul':
        case 'ol':
          createList(el, tag === 'ol', elements);
          break;
        case 'table':
          elements.push(createTable(el));
          break;
        case 'div':
        case 'section':
        case 'article':
        case 'main':
        case 'header':
        case 'footer':
        case 'nav':
        case 'aside':
          // Container elements - process children
          processNode(el, elements);
          break;
        case 'blockquote':
          elements.push(createBlockquote(el));
          break;
        case 'pre':
        case 'code':
          elements.push(createCodeBlock(el));
          break;
        // Skip: img, figure, svg, script, style, etc.
      }
    }
  });
}

/**
 * Create heading paragraph
 */
function createHeading(el: Element, tag: string): Paragraph {
  const level = parseInt(tag.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
  const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
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

/**
 * Create standard paragraph
 */
function createParagraph(el: Element): Paragraph {
  return new Paragraph({ children: extractTextRuns(el) });
}

/**
 * Create blockquote paragraph with indent
 */
function createBlockquote(el: Element): Paragraph {
  return new Paragraph({
    children: extractTextRuns(el),
    indent: { left: 720 }, // 0.5 inch indent
  });
}

/**
 * Create code block paragraph
 */
function createCodeBlock(el: Element): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: el.textContent || '',
        font: 'Courier New',
      }),
    ],
  });
}

/**
 * Extract TextRun elements from an element, preserving bold/italic
 */
function extractTextRuns(el: Element): TextRun[] {
  const runs: TextRun[] = [];
  traverseForRuns(el, runs, { bold: false, italic: false });
  return runs;
}

/**
 * Traverse DOM tree and build TextRun array with style inheritance
 */
function traverseForRuns(node: Node, runs: TextRun[], style: TextStyle): void {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold: style.bold,
            italics: style.italic,
          })
        );
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      const newStyle = { ...style };

      // Update style based on tag
      if (tag === 'strong' || tag === 'b') newStyle.bold = true;
      if (tag === 'em' || tag === 'i') newStyle.italic = true;

      // Handle line breaks
      if (tag === 'br') {
        runs.push(new TextRun({ text: '', break: 1 }));
        return;
      }

      traverseForRuns(el, runs, newStyle);
    }
  });
}

/**
 * Create list items as paragraphs with bullet/number prefix
 */
function createList(el: Element, numbered: boolean, elements: DocxElement[]): void {
  el.querySelectorAll(':scope > li').forEach((li, index) => {
    const prefix = numbered ? `${index + 1}. ` : '• ';
    const runs = extractTextRuns(li);

    // Prepend prefix
    runs.unshift(new TextRun(prefix));

    elements.push(
      new Paragraph({
        children: runs,
        indent: { left: 360 }, // 0.25 inch indent for list items
      })
    );
  });
}

/**
 * Create table from HTML table element
 */
function createTable(el: Element): Table {
  const rows: TableRow[] = [];

  el.querySelectorAll('tr').forEach((tr) => {
    const cells: TableCell[] = [];

    tr.querySelectorAll('td, th').forEach((td) => {
      cells.push(
        new TableCell({
          children: [new Paragraph({ children: extractTextRuns(td) })],
        })
      );
    });

    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  // Handle empty table edge case
  if (rows.length === 0) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [] })],
          }),
        ],
      })
    );
  }

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
