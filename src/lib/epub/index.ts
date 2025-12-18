/**
 * EPUB Generator - Main module for creating EPUB files
 * Pure browser implementation using JSZip (no Node.js dependencies)
 */

import JSZip from 'jszip';
import type { EpubOptions, EpubChapter, EpubMetadata } from './types';
import { generateUUID, textToHtml } from './utils';
import {
  generateContainerXml,
  generateContentOpf,
  generateTocNcx,
  generateContentXhtml,
  generateContentOpfMultiChapter,
  generateTocNcxMultiChapter,
  generateTocXhtml,
  generateCoverXhtml,
} from './templates';
import { getEpubStyles } from './styles';
import { buildChapterXhtml, getChapterId } from './chapter-builder';
import { processCoverImage } from './cover-handler';

// Re-export types for external use
export type { EpubOptions, EpubChapter, EpubMetadata, CoverConfig, DetectedChapter } from './types';
export { DEFAULT_COVER_CONFIG } from './types';

// Re-export chapter detection utilities
export { detectChapters, getChapterCount } from './chapter-detector';

// Re-export chapter builder utilities
export { buildChapterXhtml, getChapterFilename, getChapterId } from './chapter-builder';

// Re-export cover handler
export { processCoverImage } from './cover-handler';

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
 * Each chapter becomes a separate XHTML file with proper navigation
 * Optionally includes processed cover image
 */
export async function generateEpubWithChapters(
  metadata: EpubMetadata,
  chapters: EpubChapter[]
): Promise<Blob> {
  const { title, coverImage } = metadata;
  const uuid = generateUUID();
  const hasCover = !!coverImage;

  const zip = new JSZip();

  // mimetype must be first and uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file('META-INF/container.xml', generateContainerXml());

  // OEBPS/content.opf - multi-chapter version with optional cover
  zip.file('OEBPS/content.opf', generateContentOpfMultiChapter({ uuid, metadata, chapters, hasCover }));

  // OEBPS/toc.ncx - NCX for EPUB 2 readers
  zip.file('OEBPS/toc.ncx', generateTocNcxMultiChapter({ uuid, title, chapters }));

  // OEBPS/toc.xhtml - HTML nav for EPUB 3 readers
  zip.file('OEBPS/toc.xhtml', generateTocXhtml({ title, chapters, language: metadata.language }));

  // OEBPS/style.css
  zip.file('OEBPS/style.css', getEpubStyles());

  // Cover image (if provided)
  if (coverImage) {
    const processedCover = await processCoverImage(coverImage);
    zip.file('OEBPS/cover.xhtml', generateCoverXhtml({ language: metadata.language }));
    zip.file('OEBPS/images/cover.jpg', processedCover);
  }

  // OEBPS/chapters/chapter-XXX.xhtml for each chapter
  for (const chapter of chapters) {
    const chapterXhtml = buildChapterXhtml({ chapter, metadata });
    const filename = `OEBPS/chapters/${getChapterId(chapter.index)}.xhtml`;
    zip.file(filename, chapterXhtml);
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return blob;
}
