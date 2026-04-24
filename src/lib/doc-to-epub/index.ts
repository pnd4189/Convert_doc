/**
 * Doc-to-EPUB Library - Main Orchestrator
 * Converts DOCX/TXT files to EPUB format
 */

import { processDocx } from './docx-processor';
import { processTxt } from './txt-processor';
import {
  generateEpubWithChapters,
  detectChapters,
  type EpubMetadata,
  type EpubChapter,
} from '@/lib/epub';
import type { Chapter } from '@/lib/chapter-parser';

export interface DocToEpubOptions {
  file: File;
  metadata: EpubMetadata;
}

export interface ProcessedDocument {
  file: File;
  html: string;
  chapters: Chapter[];
}

/**
 * Process a single document file to HTML + detected chapters
 * Supports DOCX and TXT (plain or Markdown) formats
 */
export async function processDocument(file: File): Promise<ProcessedDocument> {
  const ext = file.name.toLowerCase().split('.').pop();
  let html: string;

  if (ext === 'docx') {
    const result = await processDocx(file);
    html = result.html;
  } else if (ext === 'txt') {
    const result = await processTxt(file);
    html = result.html;
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // Detect chapters from HTML content
  // Convert HTML to plain text for chapter detection
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  const chapters = detectChapters(textContent);

  return { file, html, chapters };
}

/**
 * Convert document to EPUB
 * Uses existing EPUB generation library with chapter detection
 */
export async function convertDocToEpub(options: DocToEpubOptions): Promise<Blob> {
  const { file, metadata } = options;

  const processed = await processDocument(file);

  // Build EpubChapter array from detected chapters
  const epubChapters: EpubChapter[] = processed.chapters.map((ch) => ({
    index: ch.index,
    title: ch.title,
    content: ch.content,
  }));

  // Generate EPUB using existing lib
  const blob = await generateEpubWithChapters(metadata, epubChapters);

  return blob;
}

/**
 * Batch convert multiple documents to single EPUB
 * Combines all content into sequential chapters
 */
export async function batchConvertDocsToEpub(
  files: File[],
  metadata: EpubMetadata
): Promise<Blob> {
  const allChapters: EpubChapter[] = [];
  let chapterIndex = 1;

  for (const file of files) {
    const processed = await processDocument(file);

    // Add file's chapters with adjusted indices
    processed.chapters.forEach((ch) => {
      allChapters.push({
        index: chapterIndex++,
        title: ch.title,
        content: ch.content,
      });
    });
  }

  return generateEpubWithChapters(metadata, allChapters);
}

/**
 * Convert each document to separate EPUB
 * Each file becomes an independent EPUB with its own chapters
 */
export async function batchConvertDocsToSeparateEpubs(
  files: File[],
  metadataBase: Partial<EpubMetadata>
): Promise<{ filename: string; blob: Blob }[]> {
  const results: { filename: string; blob: Blob }[] = [];

  for (const file of files) {
    const title = file.name.replace(/\.[^/.]+$/, '');
    const metadata: EpubMetadata = {
      title,
      ...metadataBase,
    };

    const blob = await convertDocToEpub({ file, metadata });
    const filename = `${title}.epub`;

    results.push({ filename, blob });
  }

  return results;
}

// Re-export processor functions and types
export { processDocx } from './docx-processor';
export { processTxt } from './txt-processor';
export type { DocxProcessResult } from './docx-processor';
export type { TxtProcessResult } from './txt-processor';
