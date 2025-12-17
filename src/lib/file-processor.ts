/**
 * File Processor - Orchestration utilities for file processing
 * Coordinates between parsers, converters, and builders
 */

import { Chapter } from './chapter-parser';
import { readFileContent, getFileType } from './docx-converter';
import { ZipFile } from './zip-builder';

export interface FileInfo {
  name: string;
  size: number;
  type: 'txt' | 'docx' | 'doc' | 'unknown';
  content?: string;
  file: File;
}

export type ProcessProgressCallback = (current: number, total: number) => void;

/**
 * Process multiple files - read their contents
 */
export async function processFiles(
  files: File[],
  onProgress?: ProcessProgressCallback
): Promise<FileInfo[]> {
  const results: FileInfo[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = await readFileContent(file);

    results.push({
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      content,
      file,
    });

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
}

/**
 * Split content by chapters into multiple files
 */
export function splitByChapters(
  content: string,
  chapters: Chapter[],
  chaptersPerFile: number,
  baseName: string
): ZipFile[] {
  const files: ZipFile[] = [];
  const totalFiles = Math.ceil(chapters.length / chaptersPerFile);

  for (let i = 0; i < totalFiles; i++) {
    const startIdx = i * chaptersPerFile;
    const endIdx = Math.min((i + 1) * chaptersPerFile, chapters.length);
    const chapterSlice = chapters.slice(startIdx, endIdx);

    // Combine chapter contents
    const combinedContent = chapterSlice.map(ch => ch.content).join('\n\n');

    // Generate filename: [baseName]_chuong_XXX-YYY.txt
    const startChapter = chapterSlice[0].index;
    const endChapter = chapterSlice[chapterSlice.length - 1].index;
    const fileName = `${baseName}_chuong_${startChapter.toString().padStart(3, '0')}-${endChapter.toString().padStart(3, '0')}.txt`;

    files.push({
      name: fileName,
      content: combinedContent,
    });
  }

  return files;
}

/**
 * Merge multiple file contents into one
 */
export function mergeFiles(files: FileInfo[]): string {
  return files
    .filter(f => f.content)
    .map(f => f.content)
    .join('\n\n');
}

/**
 * Calculate number of output files from split
 */
export function calculateSplitCount(totalChapters: number, chaptersPerFile: number): number {
  if (chaptersPerFile <= 0) return 0;
  return Math.ceil(totalChapters / chaptersPerFile);
}

/**
 * Get base name from filename (without extension)
 */
export function getBaseName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
