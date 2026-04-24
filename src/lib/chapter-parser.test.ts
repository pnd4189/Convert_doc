import { describe, it, expect } from 'vitest';
import { detectChaptersByPosition as detectChapters, getChapterCount } from './chapter-parser';

describe('detectChapters', () => {
  it('preserves pre-chapter content as preface', () => {
    const content = `Lời nói đầu của tác giả...

Chương 1: Khởi đầu
Nội dung chương 1

Chương 2: Tiếp theo
Nội dung chương 2`;

    const result = detectChapters(content);

    expect(result.length).toBe(3);
    expect(result[0].index).toBe(0);
    expect(result[0].title).toBe('Lời mở đầu');
    expect(result[0].content).toContain('Lời nói đầu của tác giả');
    expect(result[1].index).toBe(1);
    expect(result[2].index).toBe(2);
  });

  it('does not add preface when chapter starts at beginning', () => {
    const content = `Chương 1: Khởi đầu
Nội dung chương 1

Chương 2: Tiếp theo
Nội dung chương 2`;

    const result = detectChapters(content);

    expect(result.length).toBe(2);
    expect(result[0].index).toBe(1);
    expect(result[0].title).toBe('Chương 1: Khởi đầu');
  });

  it('returns fallback chapter when no pattern matches', () => {
    const content = 'Just some random text without chapter markers';

    const result = detectChapters(content);

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Nội dung');
    expect(result[0].content).toBe(content);
  });
});

describe('getChapterCount', () => {
  it('counts chapters including preface', () => {
    const content = `Preface content

Chương 1: First
Content 1

Chương 2: Second
Content 2`;

    expect(getChapterCount(content)).toBe(3);
  });

  it('counts chapters without preface', () => {
    const content = `Chương 1: First
Content 1

Chương 2: Second
Content 2`;

    expect(getChapterCount(content)).toBe(2);
  });

  it('returns 1 for content without chapters', () => {
    const content = 'No chapter markers here';

    expect(getChapterCount(content)).toBe(1);
  });
});
