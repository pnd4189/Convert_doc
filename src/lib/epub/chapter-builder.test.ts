import { describe, it, expect } from 'vitest';
import { buildChapterXhtml, getChapterId, getChapterFilename } from './chapter-builder';
import type { EpubChapter, EpubMetadata } from './types';

describe('chapter-builder', () => {
  const mockMetadata: EpubMetadata = {
    title: 'Test Book',
    author: 'Test Author',
    translator: 'Test Translator',
    language: 'vi',
  };

  const mockChapter: EpubChapter = {
    index: 1,
    title: 'Chương 1: Khởi đầu',
    content: 'Chương 1: Khởi đầu\n\nNội dung chương 1 ở đây.',
  };

  describe('buildChapterXhtml', () => {
    it('generates valid XHTML structure', () => {
      const result = buildChapterXhtml({ chapter: mockChapter, metadata: mockMetadata });

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html xmlns="http://www.w3.org/1999/xhtml" lang="vi">');
    });

    it('includes book metadata in header', () => {
      const result = buildChapterXhtml({ chapter: mockChapter, metadata: mockMetadata });

      expect(result).toContain('Test Book');
      expect(result).toContain('Tác giả: Test Author');
      expect(result).toContain('Dịch giả: Test Translator');
    });

    it('includes chapter title', () => {
      const result = buildChapterXhtml({ chapter: mockChapter, metadata: mockMetadata });

      expect(result).toContain('<h1 class="chapter-title">Chương 1: Khởi đầu</h1>');
    });

    it('removes duplicate title from content', () => {
      const result = buildChapterXhtml({ chapter: mockChapter, metadata: mockMetadata });

      // Content should only appear once (in chapter-content, not duplicated)
      const contentMatches = result.match(/Nội dung chương 1/g);
      expect(contentMatches?.length).toBe(1);
    });

    it('handles missing author/translator gracefully', () => {
      const minimalMetadata: EpubMetadata = { title: 'Minimal Book' };
      const result = buildChapterXhtml({ chapter: mockChapter, metadata: minimalMetadata });

      expect(result).not.toContain('Tác giả:');
      expect(result).not.toContain('Dịch giả:');
    });

    it('links to stylesheet with correct path', () => {
      const result = buildChapterXhtml({ chapter: mockChapter, metadata: mockMetadata });

      expect(result).toContain('href="../style.css"');
    });
  });

  describe('getChapterId', () => {
    it('generates padded chapter ID', () => {
      expect(getChapterId(1)).toBe('chapter-001');
      expect(getChapterId(10)).toBe('chapter-010');
      expect(getChapterId(100)).toBe('chapter-100');
    });

    it('handles preface (index 0)', () => {
      expect(getChapterId(0)).toBe('chapter-000');
    });
  });

  describe('getChapterFilename', () => {
    it('generates padded filename', () => {
      expect(getChapterFilename(1)).toBe('chapter-001.xhtml');
      expect(getChapterFilename(10)).toBe('chapter-010.xhtml');
    });
  });
});
