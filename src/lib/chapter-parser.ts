/**
 * Chapter Parser - Detect and parse chapters from text content
 * Supports preset patterns for Vietnamese, Chinese, and English novels
 *
 * Supported formats:
 * - Vietnamese: Chương X, Hồi X, Phần X, Quyển X Chương Y, Mục X
 * - Chinese: 第X章, 第X回, 第X节, 卷X (supports both Arabic and Chinese numerals)
 * - English: Chapter X, Part X, Book X, Volume X, Section X, Episode X
 * - Roman numerals: I, II, III, IV, V, etc.
 * - Number words: Vietnamese (Một, Hai...), English (One, Two...), Chinese (一, 二...)
 */

export interface PresetPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
}

export interface Chapter {
  index: number;
  title: string;
  startLine: number;
  endLine?: number;
  content: string;
  startPosition?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Roman numeral pattern - matches I, II, III, IV, V, VI, VII, VIII, IX, X, etc.
const ROMAN_NUMERAL = '(?:M{0,3})(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})';

// Vietnamese number words
const VN_NUMBER_WORDS = '(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|' +
  'mười\\s*một|mười\\s*hai|mười\\s*ba|mười\\s*bốn|mười\\s*lăm|mười\\s*sáu|mười\\s*bảy|mười\\s*tám|mười\\s*chín|' +
  'hai\\s*mươi|ba\\s*mươi|bốn\\s*mươi|năm\\s*mươi|sáu\\s*mươi|bảy\\s*mươi|tám\\s*mươi|chín\\s*mươi|' +
  'trăm|nghìn|ngàn|' +
  'nhất|nhị|tam|tứ|ngũ|lục|thất|bát|cửu|thập)';

// Chinese number characters (simplified + traditional + formal)
// Simple: 一二三四五六七八九十百千万亿
// Formal/Traditional: 壹贰叁肆伍陆柒捌玖拾佰仟萬億
const CHINESE_NUMBERS = '(?:[一二三四五六七八九十百千万亿壹贰叁肆伍陆柒捌玖拾佰仟萬億零〇]+)';

// Preset patterns for Vietnamese novels - ordered by popularity
export const PRESET_PATTERNS: PresetPattern[] = [
  // Arabic numbers - most common
  {
    id: 'chuong',
    name: 'Chương + Số',
    description: 'Chương 1, Chương 2, ...',
    pattern: /^\s*Chương\s+\d+/im
  },
  {
    id: 'chuong-upper',
    name: 'CHƯƠNG + Số',
    description: 'CHƯƠNG 1, CHƯƠNG 2, ...',
    pattern: /^\s*CHƯƠNG\s+\d+/im
  },
  {
    id: 'chapter',
    name: 'Chapter + Number',
    description: 'Chapter 1, Chapter 2, ...',
    pattern: /^\s*Chapter\s+\d+/im
  },

  // Roman numerals
  {
    id: 'chuong-roman',
    name: 'Chương + La Mã',
    description: 'Chương I, Chương II, Chương X, ...',
    pattern: new RegExp(`^\\s*Chương\\s+${ROMAN_NUMERAL}(?:\\s|:|$)`, 'im')
  },
  {
    id: 'chapter-roman',
    name: 'Chapter + Roman',
    description: 'Chapter I, Chapter II, ...',
    pattern: new RegExp(`^\\s*Chapter\\s+${ROMAN_NUMERAL}(?:\\s|:|$)`, 'im')
  },

  // Vietnamese number words
  {
    id: 'chuong-vn-word',
    name: 'Chương + Số chữ',
    description: 'Chương Một, Chương Hai, ...',
    pattern: new RegExp(`^\\s*Chương\\s+${VN_NUMBER_WORDS}`, 'im')
  },

  // Hoi format - common in classical novels
  {
    id: 'hoi',
    name: 'Hồi + Số',
    description: 'Hồi 1, Hồi 2, ...',
    pattern: /^\s*Hồi\s+\d+/im
  },
  {
    id: 'hoi-thu',
    name: 'Hồi thứ + Số/Chữ',
    description: 'Hồi thứ nhất, Hồi thứ 1, ...',
    pattern: new RegExp(`^\\s*Hồi\\s+thứ\\s+(?:\\d+|${VN_NUMBER_WORDS})`, 'im')
  },

  // Quyen-Chuong format
  {
    id: 'quyen-chuong',
    name: 'Quyển X Chương Y',
    description: 'Quyển 1 Chương 1, ...',
    pattern: /^\s*Quyển\s+\d+.*Chương\s+\d+/im
  },

  // Phan format
  {
    id: 'phan',
    name: 'Phần + Số',
    description: 'Phần 1, Phần 2, ...',
    pattern: /^\s*Phần\s+\d+/im
  },

  // Muc format
  {
    id: 'muc',
    name: 'Mục + Số',
    description: 'Mục 1, Mục 2, ...',
    pattern: /^\s*Mục\s+\d+/im
  },

  // ============ CHINESE PATTERNS ============
  // 第X章 format - most common in Chinese novels
  {
    id: 'di-zhang',
    name: '第X章 (Số)',
    description: '第1章, 第2章, 第100章, ...',
    pattern: /^\s*第\s*\d+\s*章/im
  },
  {
    id: 'di-zhang-cn',
    name: '第X章 (Chữ Hán)',
    description: '第一章, 第二章, 第十章, ...',
    pattern: new RegExp(`^\\s*第\\s*${CHINESE_NUMBERS}\\s*章`, 'im')
  },
  // 卷X format - volume/book in Chinese
  {
    id: 'juan',
    name: '卷X (Quyển)',
    description: '卷一, 卷1, 卷二, ...',
    pattern: new RegExp(`^\\s*卷\\s*(?:\\d+|${CHINESE_NUMBERS})`, 'im')
  },
  // 第X回 format - episode/hui in classical Chinese novels
  {
    id: 'di-hui',
    name: '第X回 (Hồi)',
    description: '第一回, 第1回, ...',
    pattern: new RegExp(`^\\s*第\\s*(?:\\d+|${CHINESE_NUMBERS})\\s*回`, 'im')
  },
  // 第X节 format - section in Chinese
  {
    id: 'di-jie',
    name: '第X节 (Tiết)',
    description: '第一节, 第1节, ...',
    pattern: new RegExp(`^\\s*第\\s*(?:\\d+|${CHINESE_NUMBERS})\\s*节`, 'im')
  },

  // ============ ENGLISH PATTERNS ============
  // Part format
  {
    id: 'part',
    name: 'Part + Number',
    description: 'Part 1, Part 2, Part One, ...',
    pattern: /^\s*Part\s+(?:\d+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)/im
  },
  // Book format
  {
    id: 'book',
    name: 'Book + Number',
    description: 'Book 1, Book 2, Book One, ...',
    pattern: /^\s*Book\s+(?:\d+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)/im
  },
  // Volume format
  {
    id: 'volume',
    name: 'Volume + Number',
    description: 'Volume 1, Vol. 1, Vol 2, ...',
    pattern: /^\s*(?:Volume|Vol\.?)\s+\d+/im
  },
  // Section format
  {
    id: 'section',
    name: 'Section + Number',
    description: 'Section 1, Section 2, ...',
    pattern: /^\s*Section\s+\d+/im
  },
  // Episode format
  {
    id: 'episode',
    name: 'Episode + Number',
    description: 'Episode 1, Ep. 1, ...',
    pattern: /^\s*(?:Episode|Ep\.?)\s+\d+/im
  },

  // Arc-code format: HP001, GIM001, Final001, GIM-LSF 118 (common in Chinese web novels)
  {
    id: 'arc-code',
    name: 'Arc Code (HP001/GIM001/Final001)',
    description: 'HP001, GIM001, Final068, GIM-LSF 118, ...',
    pattern: /^[A-Za-z]{2,6}(?:-[A-Za-z]{2,4})?\s*\d{2,4}(?:\s|$)/m
  },

  // Auto-detect - tries multiple patterns
  {
    id: 'auto',
    name: 'Tự động phát hiện',
    description: 'Thử nhiều pattern phổ biến (VN/CN/EN/arc-code)',
    pattern: new RegExp(
      `^\\s*(?:` +
      // Vietnamese patterns
      `Chương\\s+(?:\\d+|${ROMAN_NUMERAL}|${VN_NUMBER_WORDS})|` +
      `CHƯƠNG\\s+\\d+|` +
      `Hồi\\s+(?:\\d+|thứ\\s+(?:\\d+|${VN_NUMBER_WORDS}))|` +
      `Quyển\\s+\\d+.*Chương\\s+\\d+|` +
      `Phần\\s+\\d+|` +
      `Mục\\s+\\d+|` +
      // Chinese patterns
      `第\\s*(?:\\d+|${CHINESE_NUMBERS})\\s*章|` +
      `第\\s*(?:\\d+|${CHINESE_NUMBERS})\\s*回|` +
      `第\\s*(?:\\d+|${CHINESE_NUMBERS})\\s*节|` +
      `卷\\s*(?:\\d+|${CHINESE_NUMBERS})|` +
      // English patterns
      `Chapter\\s+(?:\\d+|${ROMAN_NUMERAL})|` +
      `Part\\s+(?:\\d+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)|` +
      `Book\\s+(?:\\d+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)|` +
      `(?:Volume|Vol\\.?)\\s+\\d+|` +
      `Section\\s+\\d+|` +
      `(?:Episode|Ep\\.?)\\s+\\d+|` +
      // Arc-code format: HP001, GIM001, Final001, GIM-LSF 118
      `[A-Za-z]{2,6}(?:-[A-Za-z]{2,4})?\\s*\\d{2,4}(?:\\s|$)` +
      `)`, 'im'
    )
  },
];

/**
 * Normalize text for better chapter detection
 * - Remove BOM (Byte Order Mark)
 * - Normalize line endings (CRLF/CR -> LF)
 * - Remove zero-width characters
 */
export function normalizeText(text: string): string {
  return text
    // Remove BOM
    .replace(/^\uFEFF/, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

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
 * Automatically normalizes text before parsing
 */
export function parseChapters(text: string, pattern: RegExp): Chapter[] {
  // Normalize text first
  const normalizedText = normalizeText(text);
  const lines = normalizedText.split('\n');
  const chapters: Chapter[] = [];

  // Find all chapter start positions
  const chapterStarts: { lineIndex: number; title: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip empty lines for matching
    if (!line.trim()) continue;

    const match = line.match(pattern);
    if (match) {
      chapterStarts.push({
        lineIndex: i,
        title: line.trim(),
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
 * Auto-detect best matching pattern for the content
 * Returns pattern ID and match count
 */
export function autoDetectPattern(text: string): { patternId: string; matchCount: number } {
  const normalizedText = normalizeText(text);
  let bestMatch = { patternId: 'auto', matchCount: 0 };

  // Test each pattern (except 'auto') and find the one with most matches
  for (const preset of PRESET_PATTERNS) {
    if (preset.id === 'auto') continue;

    const lines = normalizedText.split('\n');
    let matchCount = 0;

    for (const line of lines) {
      if (line.trim() && preset.pattern.test(line)) {
        matchCount++;
      }
    }

    if (matchCount > bestMatch.matchCount) {
      bestMatch = { patternId: preset.id, matchCount };
    }
  }

  return bestMatch;
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

/** Regex patterns for char-position-based chapter detection */
const POSITION_PATTERNS: RegExp[] = [
  /^(Chương|CHƯƠNG|Chapter|CHAPTER)\s+(\d+)[:\.\s]*(.*)?$/gm,
  /^(Hồi|Quyển|Phần)\s+(\d+)[:\.\s]*(.*)?$/gm,
  /^(\d+)[:\.\s]+(.+)$/gm,
];

interface ChapterMarker {
  index: number;
  title: string;
  position: number;
}

function findChapterMarkers(content: string): ChapterMarker[] {
  const markers: ChapterMarker[] = [];
  for (const pattern of POSITION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      markers.push({ index: markers.length + 1, title: match[0].trim(), position: match.index });
    }
    if (markers.length > 0) break;
  }
  return markers;
}

/**
 * Detect chapters by char position (for EPUB generation)
 * Preserves pre-chapter content as "Lời mở đầu" (preface)
 */
export function detectChaptersByPosition(content: string): Chapter[] {
  const markers = findChapterMarkers(content);
  if (markers.length === 0) {
    return [{ index: 1, title: 'Nội dung', content: content.trim(), startLine: 0, endLine: 0, startPosition: 0 }];
  }
  const chapters: Chapter[] = [];
  if (markers[0].position > 0) {
    const preface = content.slice(0, markers[0].position).trim();
    if (preface.length > 0) {
      chapters.push({ index: 0, title: 'Lời mở đầu', content: preface, startLine: 0, endLine: 0, startPosition: 0 });
    }
  }
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].position;
    const end = markers[i + 1]?.position ?? content.length;
    chapters.push({
      index: i + 1,
      title: markers[i].title,
      content: content.slice(start, end).trim(),
      startLine: 0,
      endLine: 0,
      startPosition: start,
    });
  }
  return chapters;
}

/**
 * Get chapter count without full parsing (lightweight)
 */
export function getChapterCount(content: string): number {
  const markers = findChapterMarkers(content);
  if (markers.length === 0) return 1;
  return markers[0].position > 0 ? markers.length + 1 : markers.length;
}

/**
 * Detect chapters using a user-provided custom regex pattern
 */
export function detectWithCustomRegex(text: string, patternStr: string): Chapter[] {
  let regex: RegExp;
  try {
    regex = new RegExp(patternStr, 'gm');
  } catch {
    throw new Error(`Invalid regex pattern: ${patternStr}`);
  }
  return parseChapters(text, regex);
}

/**
 * Filter chapters by 1-based range. 0 means no limit.
 */
export function filterChaptersByRange<T extends { index: number }>(
  chapters: T[],
  range: { start: number; end: number }
): T[] {
  if (range.start <= 0 && range.end <= 0) return chapters;
  return chapters
    .filter((ch) => {
      if (range.start > 0 && ch.index < range.start) return false;
      if (range.end > 0 && ch.index > range.end) return false;
      return true;
    })
    .map((ch, i) => ({ ...ch, index: i + 1 }));
}
