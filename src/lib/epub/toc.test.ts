import { describe, it, expect } from 'vitest';
import {
  generateTocNcxMultiChapter,
  generateTocXhtml,
  generateContentOpfMultiChapter,
} from './templates';
import type { EpubChapter, EpubMetadata } from './types';

const mockChapters: EpubChapter[] = [
  { index: 0, title: 'Lời mở đầu', content: 'Preface content' },
  { index: 1, title: 'Chương 1: Khởi đầu', content: 'Chapter 1 content' },
  { index: 2, title: 'Chương 2: Tiếp theo', content: 'Chapter 2 content' },
];

const mockMetadata: EpubMetadata = {
  title: 'Test Book',
  author: 'Test Author',
  language: 'vi',
};

describe('generateTocNcxMultiChapter', () => {
  it('generates valid NCX structure', () => {
    const result = generateTocNcxMultiChapter({
      uuid: 'test-uuid',
      title: 'Test Book',
      chapters: mockChapters,
    });

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/"');
    expect(result).toContain('<docTitle>');
    expect(result).toContain('<navMap>');
  });

  it('includes all chapter navPoints', () => {
    const result = generateTocNcxMultiChapter({
      uuid: 'test-uuid',
      title: 'Test Book',
      chapters: mockChapters,
    });

    expect(result).toContain('id="chapter-000"');
    expect(result).toContain('id="chapter-001"');
    expect(result).toContain('id="chapter-002"');
    expect(result).toContain('Lời mở đầu');
    expect(result).toContain('Chương 1: Khởi đầu');
  });

  it('generates correct playOrder', () => {
    const result = generateTocNcxMultiChapter({
      uuid: 'test-uuid',
      title: 'Test Book',
      chapters: mockChapters,
    });

    expect(result).toContain('playOrder="1"');
    expect(result).toContain('playOrder="2"');
    expect(result).toContain('playOrder="3"');
  });
});

describe('generateTocXhtml', () => {
  it('generates valid EPUB 3 nav structure', () => {
    const result = generateTocXhtml({
      title: 'Test Book',
      chapters: mockChapters,
      language: 'vi',
    });

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('xmlns:epub="http://www.idpf.org/2007/ops"');
    expect(result).toContain('epub:type="toc"');
    expect(result).toContain('<ol class="toc-list">');
  });

  it('includes all chapter links', () => {
    const result = generateTocXhtml({
      title: 'Test Book',
      chapters: mockChapters,
    });

    expect(result).toContain('href="chapters/chapter-000.xhtml"');
    expect(result).toContain('href="chapters/chapter-001.xhtml"');
    expect(result).toContain('href="chapters/chapter-002.xhtml"');
  });

  it('escapes chapter titles', () => {
    const chaptersWithSpecialChars: EpubChapter[] = [
      { index: 1, title: 'Chapter <1> & "Test"', content: 'content' },
    ];

    const result = generateTocXhtml({
      title: 'Test',
      chapters: chaptersWithSpecialChars,
    });

    expect(result).toContain('Chapter &lt;1&gt; &amp; &quot;Test&quot;');
  });
});

describe('generateContentOpfMultiChapter', () => {
  it('includes nav item with properties="nav"', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
    });

    expect(result).toContain('id="nav"');
    expect(result).toContain('href="toc.xhtml"');
    expect(result).toContain('properties="nav"');
  });

  it('includes nav in spine', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
    });

    expect(result).toContain('<itemref idref="nav"/>');
  });

  it('uses EPUB 3.0 version', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
    });

    expect(result).toContain('version="3.0"');
  });

  it('includes dcterms:modified meta', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
    });

    expect(result).toContain('property="dcterms:modified"');
  });
});
