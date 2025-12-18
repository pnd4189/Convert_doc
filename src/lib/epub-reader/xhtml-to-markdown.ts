/**
 * XHTML to Markdown Converter
 * Converts XHTML content to Markdown format for TXT output
 */

/**
 * Convert XHTML string to Markdown
 * @param xhtml - XHTML content string
 * @returns Markdown formatted string
 */
export function xhtmlToMarkdown(xhtml: string): string {
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const body = doc.querySelector('body') || doc.documentElement;

  return processNodeToMd(body).trim();
}

/**
 * Process DOM node and convert to Markdown string
 */
function processNodeToMd(node: Node): string {
  let result = '';

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      result += elementToMd(child as Element);
    }
  });

  return result;
}

/**
 * Convert single element to Markdown
 */
function elementToMd(el: Element): string {
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    // Headings
    case 'h1':
      return `\n# ${el.textContent?.trim()}\n\n`;
    case 'h2':
      return `\n## ${el.textContent?.trim()}\n\n`;
    case 'h3':
      return `\n### ${el.textContent?.trim()}\n\n`;
    case 'h4':
      return `\n#### ${el.textContent?.trim()}\n\n`;
    case 'h5':
      return `\n##### ${el.textContent?.trim()}\n\n`;
    case 'h6':
      return `\n###### ${el.textContent?.trim()}\n\n`;

    // Paragraph
    case 'p':
      return `${processInline(el)}\n\n`;

    // Line break
    case 'br':
      return '\n';

    // Inline formatting
    case 'strong':
    case 'b':
      return `**${processNodeToMd(el)}**`;
    case 'em':
    case 'i':
      return `*${processNodeToMd(el)}*`;
    case 'code':
      return `\`${el.textContent || ''}\``;

    // Links
    case 'a': {
      const href = el.getAttribute('href') || '';
      return `[${el.textContent}](${href})`;
    }

    // Lists
    case 'ul':
      return processListToMd(el, false);
    case 'ol':
      return processListToMd(el, true);
    case 'li':
      return el.textContent?.trim() || '';

    // Tables
    case 'table':
      return processTableToMd(el);

    // Blockquote
    case 'blockquote':
      return processBlockquoteToMd(el);

    // Code blocks
    case 'pre': {
      const code = el.querySelector('code')?.textContent || el.textContent || '';
      return `\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`;
    }

    // Horizontal rule
    case 'hr':
      return '\n---\n\n';

    // Container elements - process children
    case 'div':
    case 'section':
    case 'article':
    case 'main':
    case 'header':
    case 'footer':
    case 'nav':
    case 'aside':
    case 'span':
      return processNodeToMd(el);

    // Skip: img, figure, svg, script, style
    case 'img':
    case 'figure':
    case 'svg':
    case 'script':
    case 'style':
      return '';

    default:
      return processNodeToMd(el);
  }
}

/**
 * Process inline elements within a paragraph
 */
function processInline(el: Element): string {
  let result = '';
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      result += elementToMd(child as Element);
    }
  });
  return result;
}

/**
 * Convert list to Markdown format
 */
function processListToMd(el: Element, numbered: boolean): string {
  let result = '\n';
  el.querySelectorAll(':scope > li').forEach((li, i) => {
    const prefix = numbered ? `${i + 1}. ` : '- ';
    const content = processInline(li).trim();
    result += `${prefix}${content}\n`;
  });
  return result + '\n';
}

/**
 * Convert table to Markdown format
 */
function processTableToMd(el: Element): string {
  const rows = el.querySelectorAll('tr');
  if (rows.length === 0) return '';

  let result = '\n';
  let isFirst = true;

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td, th');
    const cellTexts = Array.from(cells).map((c) => c.textContent?.trim() || '');
    result += `| ${cellTexts.join(' | ')} |\n`;

    // Add separator after header row
    if (isFirst && cells.length > 0) {
      result += `| ${cellTexts.map(() => '---').join(' | ')} |\n`;
      isFirst = false;
    }
  });

  return result + '\n';
}

/**
 * Convert blockquote to Markdown format
 */
function processBlockquoteToMd(el: Element): string {
  const content = processNodeToMd(el).trim();
  const lines = content.split('\n');
  return '\n' + lines.map((line) => `> ${line}`).join('\n') + '\n\n';
}
