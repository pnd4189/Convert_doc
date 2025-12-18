/**
 * Chapter Detector - Auto-detect chapters from text content using regex patterns
 */

import type { DetectedChapter } from './types';

/** Regex patterns for chapter detection (Vietnamese, English, numeric) */
const CHAPTER_PATTERNS: RegExp[] = [
  // Vietnamese: Chương 1, CHƯƠNG 1: Tên chương
  /^(Chương|CHƯƠNG|Chapter|CHAPTER)\s+(\d+)[:\.\s]*(.*)?$/gm,
  // Vietnamese variants: Hồi, Quyển, Phần
  /^(Hồi|Quyển|Phần)\s+(\d+)[:\.\s]*(.*)?$/gm,
  // Numeric: "1: Tên chương" or "1. Tên chương"
  /^(\d+)[:\.\s]+(.+)$/gm,
];

interface ChapterMarker {
  index: number;
  title: string;
  position: number;
}

/**
 * Find chapter markers without content splitting
 * Used internally for both detectChapters() and getChapterCount()
 */
function findChapterMarkers(content: string): ChapterMarker[] {
  const markers: ChapterMarker[] = [];

  // Try each pattern until one matches
  for (const pattern of CHAPTER_PATTERNS) {
    // Create fresh regex instance for each iteration
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      markers.push({
        index: markers.length + 1,
        title: match[0].trim(),
        position: match.index,
      });
    }

    // Use first matching pattern that finds chapters
    if (markers.length > 0) break;
  }

  return markers;
}

/**
 * Detect chapters from content using regex patterns
 * Returns array of chapters with title and content
 * Falls back to single chapter if no patterns match
 * Preserves pre-chapter content as "Lời mở đầu" (preface)
 */
export function detectChapters(content: string): DetectedChapter[] {
  const markers = findChapterMarkers(content);

  // No chapters found - return single chapter with full content
  if (markers.length === 0) {
    return [{
      index: 1,
      title: 'Nội dung',
      content: content.trim(),
      startPosition: 0,
    }];
  }

  const chapters: DetectedChapter[] = [];

  // Handle pre-chapter content (preface, foreword, author notes)
  if (markers[0].position > 0) {
    const prefaceContent = content.slice(0, markers[0].position).trim();
    if (prefaceContent.length > 0) {
      chapters.push({
        index: 0, // Index 0 signals preface
        title: 'Lời mở đầu',
        content: prefaceContent,
        startPosition: 0,
      });
    }
  }

  // Split content between markers
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].position;
    const end = markers[i + 1]?.position ?? content.length;
    const chapterContent = content.slice(start, end).trim();

    chapters.push({
      index: i + 1,
      title: markers[i].title,
      content: chapterContent,
      startPosition: start,
    });
  }

  return chapters;
}

/**
 * Get chapter count without full content parsing
 * Efficient for quick preview - only counts markers, no string slicing
 */
export function getChapterCount(content: string): number {
  const markers = findChapterMarkers(content);
  if (markers.length === 0) return 1; // Fallback single chapter
  // +1 if preface exists (content before first marker)
  return markers[0].position > 0 ? markers.length + 1 : markers.length;
}
