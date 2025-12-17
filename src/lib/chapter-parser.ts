/**
 * Chapter Parser - Detect and parse chapters from text content
 * Supports preset patterns for Vietnamese novels and custom regex
 */

export interface PresetPattern {
  id: string;
  name: string;
  pattern: RegExp;
}

export interface Chapter {
  index: number;
  title: string;
  startLine: number;
  endLine: number;
  content: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Preset patterns for Vietnamese novels
export const PRESET_PATTERNS: PresetPattern[] = [
  { id: 'chuong', name: 'Chương X', pattern: /^Chương\s+\d+/im },
  { id: 'chuong-upper', name: 'CHƯƠNG X', pattern: /^CHƯƠNG\s+\d+/im },
  { id: 'chapter', name: 'Chapter X', pattern: /^Chapter\s+\d+/im },
  { id: 'hoi', name: 'Hồi X', pattern: /^Hồi\s+\d+/im },
  { id: 'quyen-chuong', name: 'Quyển X Chương Y', pattern: /^Quyển\s+\d+.*Chương\s+\d+/im },
];

/**
 * Validate a regex pattern string
 */
export function validatePattern(patternStr: string): ValidationResult {
  if (!patternStr.trim()) {
    return { valid: false, error: 'Pattern không được để trống' };
  }

  try {
    new RegExp(patternStr, 'im');
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Regex không hợp lệ: ${(e as Error).message}` };
  }
}

/**
 * Parse chapters from text content using a regex pattern
 */
export function parseChapters(text: string, pattern: RegExp): Chapter[] {
  const lines = text.split('\n');
  const chapters: Chapter[] = [];

  // Find all chapter start positions
  const chapterStarts: { lineIndex: number; title: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern);
    if (match) {
      chapterStarts.push({
        lineIndex: i,
        title: lines[i].trim(),
      });
    }
  }

  // Build chapter objects
  for (let i = 0; i < chapterStarts.length; i++) {
    const start = chapterStarts[i];
    const nextStart = chapterStarts[i + 1];
    const endLine = nextStart ? nextStart.lineIndex - 1 : lines.length - 1;

    const contentLines = lines.slice(start.lineIndex, endLine + 1);

    chapters.push({
      index: i + 1,
      title: start.title,
      startLine: start.lineIndex + 1, // 1-indexed for display
      endLine: endLine + 1,
      content: contentLines.join('\n'),
    });
  }

  return chapters;
}

/**
 * Get preview chapters (first N chapters)
 */
export function getPreviewChapters(chapters: Chapter[], count: number = 5): Chapter[] {
  return chapters.slice(0, count);
}

/**
 * Get pattern by ID from presets
 */
export function getPatternById(id: string): PresetPattern | undefined {
  return PRESET_PATTERNS.find(p => p.id === id);
}

/**
 * Create RegExp from pattern string
 */
export function createPattern(patternStr: string): RegExp {
  return new RegExp(patternStr, 'im');
}
