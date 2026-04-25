/**
 * EPUB Generator - Main module for creating EPUB files
 * Pure browser implementation using JSZip (no Node.js dependencies)
 */

import JSZip from 'jszip';
import type { EpubChapter, EpubMetadata } from './types';
import { generateUUID } from './utils';
import {
  generateContainerXml,
  generateContentOpfMultiChapter,
  generateTocNcxMultiChapter,
  generateTocXhtml,
  generateCoverXhtml,
} from './templates';
import { getEpubStyles, getCjkStyles } from './styles';
import { buildChapterXhtml, getChapterId } from './chapter-builder';
import { processCoverImage } from './cover-handler';

// Re-export types for external use
export type { EpubChapter, EpubMetadata, CoverConfig } from './types';
export { DEFAULT_COVER_CONFIG } from './types';

// Re-export chapter detection from unified module
export { detectChaptersByPosition as detectChapters, getChapterCount } from '@/lib/chapter-parser';
export type { Chapter as DetectedChapter } from '@/lib/chapter-parser';

// Re-export chapter builder utilities
export { buildChapterXhtml, getChapterFilename, getChapterId } from './chapter-builder';

// Re-export cover handler
export { processCoverImage } from './cover-handler';

/**
 * Generate EPUB with multiple chapters
 * Each chapter becomes a separate XHTML file with proper navigation
 * Optionally includes processed cover image and embedded font
 */
export async function generateEpubWithChapters(
  metadata: EpubMetadata,
  chapters: EpubChapter[],
  options?: { fontFile?: File | null }
): Promise<Blob> {
  const { title, coverImage } = metadata;
  const uuid = generateUUID();
  const hasCover = !!coverImage;
  const fontFile = options?.fontFile ?? null;

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

  // Font embedding
  let fontFileName = '';
  if (fontFile) {
    // Sanitize: use only the base filename, strip path traversal
    const safeName = fontFile.name.replace(/.*[/\\]/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    fontFileName = safeName;
    const fontData = await fontFile.arrayBuffer();
    zip.file(`OEBPS/fonts/${fontFileName}`, fontData);
  }

  // OEBPS/style.css - use CJK CSS if font embedded
  const css = fontFile ? getCjkStyles(fontFileName) : getEpubStyles();
  zip.file('OEBPS/style.css', css);

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
