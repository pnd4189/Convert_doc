/**
 * Chapter Builder - Build individual chapter XHTML files for EPUB
 */

import type { EpubChapter, EpubMetadata } from './types';
import { escapeXml, textToHtml } from './utils';

export interface ChapterBuildOptions {
  chapter: EpubChapter;
  metadata: EpubMetadata;
}

/**
 * Build XHTML content for a single chapter
 * Includes book header with title, author, translator
 */
export function buildChapterXhtml(options: ChapterBuildOptions): string {
  const { chapter, metadata } = options;
  const { title, author, translator, language = 'vi' } = metadata;

  // Skip chapter title line from content if it starts with the title
  const contentWithoutTitle = chapter.content.startsWith(chapter.title)
    ? chapter.content.slice(chapter.title.length).trim()
    : chapter.content;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${language}">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="../style.css"/>
</head>
<body>
  <div class="chapter-header">
    <p class="book-title">${escapeXml(title)}</p>
${author ? `    <p class="author">Tác giả: ${escapeXml(author)}</p>\n` : ''}${translator ? `    <p class="translator">Dịch giả: ${escapeXml(translator)}</p>\n` : ''}    <h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
  </div>
  <div class="chapter-content">
    ${textToHtml(contentWithoutTitle)}
  </div>
</body>
</html>`;
}

/**
 * Generate chapter filename from index
 * Format: chapter-001.xhtml, chapter-002.xhtml, etc.
 */
export function getChapterFilename(index: number): string {
  return `chapter-${String(index).padStart(3, '0')}.xhtml`;
}

/**
 * Generate chapter ID from index
 * Format: chapter-001, chapter-002, etc.
 */
export function getChapterId(index: number): string {
  return `chapter-${String(index).padStart(3, '0')}`;
}
