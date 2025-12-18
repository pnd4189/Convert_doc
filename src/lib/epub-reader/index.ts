/**
 * EPUB Reader Library - Main Entry Point
 * Orchestrates EPUB extraction and conversion to DOCX/Markdown
 */

import { Document, Packer } from 'docx';
import { parseEpub, EpubContent, EpubXhtmlChapter } from './epub-parser';
import { xhtmlToDocxElements } from './xhtml-to-docx';
import { xhtmlToMarkdown } from './xhtml-to-markdown';

// Re-export types for external use
export type { EpubContent, EpubXhtmlChapter } from './epub-parser';

export interface ConvertResult {
  filename: string;
  blob: Blob;
}

export interface ConvertProgress {
  current: number;
  total: number;
  filename: string;
}

/**
 * Extract and parse EPUB file content
 * @param file - EPUB file to parse
 * @returns Parsed EPUB content
 */
export async function extractEpubContent(file: File): Promise<EpubContent> {
  return parseEpub(file);
}

/**
 * Convert EPUB file to DOCX format
 * @param file - EPUB file to convert
 * @returns ConvertResult with filename and blob
 */
export async function convertEpubToDocx(file: File): Promise<ConvertResult> {
  const epub = await parseEpub(file);

  // Combine all chapters' XHTML into docx elements
  const allElements = epub.chapters.flatMap((ch) => xhtmlToDocxElements(ch.content));

  const doc = new Document({
    title: epub.title,
    creator: epub.author,
    sections: [
      {
        children: allElements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = file.name.replace(/\.epub$/i, '.docx');

  return { filename, blob };
}

/**
 * Convert EPUB file to Markdown TXT format
 * @param file - EPUB file to convert
 * @returns ConvertResult with filename and blob
 */
export async function convertEpubToMarkdown(file: File): Promise<ConvertResult> {
  const epub = await parseEpub(file);

  // Build markdown with title and author header
  let markdown = '';
  if (epub.title) {
    markdown += `# ${epub.title}\n\n`;
  }
  if (epub.author) {
    markdown += `**Author:** ${epub.author}\n\n`;
  }

  // Add separator before content
  markdown += '---\n\n';

  // Combine all chapters' XHTML into markdown
  markdown += epub.chapters.map((ch) => xhtmlToMarkdown(ch.content)).join('\n\n---\n\n');

  const blob = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
  const filename = file.name.replace(/\.epub$/i, '.txt');

  return { filename, blob };
}

/**
 * Batch convert multiple EPUB files
 * @param files - Array of EPUB files (max 10)
 * @param format - Output format: 'docx' or 'txt'
 * @param onProgress - Optional progress callback
 * @returns Array of ConvertResult
 */
export async function batchConvertEpub(
  files: File[],
  format: 'docx' | 'txt',
  onProgress?: (progress: ConvertProgress) => void
): Promise<ConvertResult[]> {
  // Limit to 10 files
  const filesToProcess = files.slice(0, 10);
  const results: ConvertResult[] = [];
  const converter = format === 'docx' ? convertEpubToDocx : convertEpubToMarkdown;

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];

    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: filesToProcess.length,
        filename: file.name,
      });
    }

    try {
      const result = await converter(file);
      results.push(result);
    } catch (error) {
      console.error(`Failed to convert ${file.name}:`, error);
      // Continue with other files - don't fail entire batch
    }
  }

  return results;
}

/**
 * Validate if file is a valid EPUB
 * @param file - File to validate
 * @returns true if file appears to be valid EPUB
 */
export async function isValidEpub(file: File): Promise<boolean> {
  try {
    // Quick validation: check file extension and try to parse
    if (!file.name.toLowerCase().endsWith('.epub')) {
      return false;
    }

    // Try to extract content - will throw if invalid
    await parseEpub(file);
    return true;
  } catch {
    return false;
  }
}
