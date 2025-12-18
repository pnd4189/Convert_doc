/**
 * TXT Processor - Convert TXT/Markdown files to HTML
 * Auto-detects Markdown patterns and uses appropriate parser
 */

import { marked } from 'marked';

/**
 * Detect if text content is Markdown formatted
 * Checks for common Markdown patterns (headings, bold, italic, lists, links, etc.)
 * @returns true if 2+ Markdown patterns detected
 */
function isMarkdown(text: string): boolean {
  const patterns = [
    /^#{1,6}\s+/m, // # Heading
    /\*\*[^*]+\*\*/, // **bold**
    /\*[^*]+\*/, // *italic*
    /^[-*]\s+/m, // - list or * list
    /^\d+\.\s+/m, // 1. numbered list
    /\[.+\]\(.+\)/, // [link](url)
    /^>\s+/m, // > blockquote
    /`[^`]+`/, // `code`
    /^\|.+\|$/m, // | table |
  ];

  // If 2+ patterns match, likely Markdown
  let matches = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      matches++;
      if (matches >= 2) return true;
    }
  }

  return false;
}

/**
 * Convert plain text to HTML
 * Wraps paragraphs in <p> tags and preserves line breaks
 */
function plainTextToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
}

export interface TxtProcessResult {
  html: string;
  isMarkdown: boolean;
}

/**
 * Convert TXT file to HTML
 * Auto-detects Markdown and uses appropriate parser
 */
export async function processTxt(file: File): Promise<TxtProcessResult> {
  const text = await file.text();

  if (isMarkdown(text)) {
    // Use marked for Markdown parsing
    const html = await marked.parse(text, {
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    return { html, isMarkdown: true };
  }

  // Plain text - simple paragraph wrapping
  const html = plainTextToHtml(text);
  return { html, isMarkdown: false };
}

/**
 * Batch process multiple TXT files to HTML
 * @param files - Array of TXT files
 * @returns Array of HTML strings
 */
export async function batchProcessTxt(files: File[]): Promise<string[]> {
  const htmls: string[] = [];

  for (const file of files) {
    const result = await processTxt(file);
    htmls.push(result.html);
  }

  return htmls;
}
