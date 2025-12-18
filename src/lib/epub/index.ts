/**
 * EPUB Generator - Main module for creating EPUB files
 * Pure browser implementation using JSZip (no Node.js dependencies)
 */

import JSZip from 'jszip';
import type { EpubOptions, EpubChapter } from './types';
import { generateUUID, textToHtml } from './utils';
import {
  generateContainerXml,
  generateContentOpf,
  generateTocNcx,
  generateContentXhtml,
} from './templates';
import { getEpubStyles } from './styles';

// Re-export types for external use
export type { EpubOptions, EpubChapter, EpubMetadata, CoverConfig } from './types';
export { DEFAULT_COVER_CONFIG } from './types';

/**
 * Generate EPUB from text content
 * Creates a valid EPUB 2.0 structure
 */
export async function generateEpub(options: EpubOptions): Promise<Blob> {
  const { title, author = 'Unknown', content } = options;
  const uuid = generateUUID();
  const language = 'vi';

  const zip = new JSZip();

  // mimetype must be first and uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file('META-INF/container.xml', generateContainerXml());

  // OEBPS/content.opf
  zip.file('OEBPS/content.opf', generateContentOpf({ uuid, title, author, language }));

  // OEBPS/toc.ncx
  zip.file('OEBPS/toc.ncx', generateTocNcx({ uuid, title }));

  // OEBPS/style.css
  zip.file('OEBPS/style.css', getEpubStyles());

  // OEBPS/content.xhtml
  const htmlContent = textToHtml(content);
  zip.file('OEBPS/content.xhtml', generateContentXhtml({ title, htmlContent }));

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return blob;
}

/**
 * Generate EPUB with multiple chapters
 * @deprecated Use enhanced version in future phases
 */
export async function generateEpubWithChapters(
  title: string,
  chapters: EpubChapter[],
  author: string = 'Unknown'
): Promise<Blob> {
  // Combine all chapters into single content for simplicity
  const combinedContent = chapters
    .map((ch) => `${ch.title}\n\n${ch.content}`)
    .join('\n\n---\n\n');

  return generateEpub({
    title,
    author,
    content: combinedContent,
  });
}
