/**
 * TXT Processor - Convert TXT/Markdown files to HTML
 * Auto-detects Markdown patterns and uses appropriate parser
 * Supports encoding detection for non-UTF-8 files (GBK, Big5, etc.)
 */

import { marked } from 'marked';

/** CJK encodings to try when UTF-8 fails */
const CJK_ENCODINGS = ['utf-8', 'gbk', 'gb2312', 'big5', 'shift-jis', 'euc-jp', 'euc-kr'];

/**
 * Detect and read a file, trying multiple encodings if UTF-8 fails.
 * Falls back gracefully to UTF-8 with replacement characters.
 */
async function detectAndReadFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  // Try UTF-8 first (most common)
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(uint8);
  } catch {
    // Not valid UTF-8, try other encodings
  }

  // Try CJK encodings
  for (const enc of CJK_ENCODINGS.slice(1)) {
    try {
      return new TextDecoder(enc, { fatal: true }).decode(uint8);
    } catch {
      continue;
    }
  }

  // Fallback: UTF-8 with replacement
  return new TextDecoder('utf-8', { fatal: false }).decode(uint8);
}

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
  text: string;
}

export interface TxtProcessOptions {
  encoding?: string;
  customPattern?: string;
}

/**
 * Convert TXT file to HTML with encoding detection
 */
export async function processTxt(file: File, options?: TxtProcessOptions): Promise<TxtProcessResult> {
  let text: string;
  if (options?.encoding && options.encoding !== 'auto') {
    const buffer = await file.arrayBuffer();
    text = new TextDecoder(options.encoding, { fatal: false }).decode(new Uint8Array(buffer));
  } else {
    text = await detectAndReadFile(file);
  }

  if (isMarkdown(text)) {
    const html = await marked.parse(text, {
      gfm: true,
      breaks: true,
    });
    return { html, isMarkdown: true, text };
  }

  const html = plainTextToHtml(text);
  return { html, isMarkdown: false, text };
}

/**
 * Batch process multiple TXT files to HTML
 */
export async function batchProcessTxt(files: File[]): Promise<string[]> {
  const htmls: string[] = [];
  for (const file of files) {
    const result = await processTxt(file);
    htmls.push(result.html);
  }
  return htmls;
}
