import { describe, it, expect } from 'vitest';
import {
  generateCoverXhtml,
  generateContentOpfMultiChapter,
} from './templates';
import type { EpubChapter, EpubMetadata } from './types';

const mockChapters: EpubChapter[] = [
  { index: 1, title: 'Chapter 1', content: 'Content 1' },
];

const mockMetadata: EpubMetadata = {
  title: 'Test Book',
  author: 'Test Author',
};

describe('generateCoverXhtml', () => {
  it('generates valid cover page structure', () => {
    const result = generateCoverXhtml({ language: 'vi' });

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<title>Cover</title>');
  });

  it('includes cover image reference', () => {
    const result = generateCoverXhtml();

    expect(result).toContain('src="images/cover.jpg"');
    expect(result).toContain('alt="Cover"');
  });

  it('uses correct language', () => {
    const result = generateCoverXhtml({ language: 'en' });

    expect(result).toContain('lang="en"');
  });

  it('defaults to Vietnamese language', () => {
    const result = generateCoverXhtml();

    expect(result).toContain('lang="vi"');
  });
});

describe('generateContentOpfMultiChapter with cover', () => {
  it('includes cover metadata when hasCover is true', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
      hasCover: true,
    });

    expect(result).toContain('<meta name="cover" content="cover-image"/>');
  });

  it('includes cover manifest items when hasCover is true', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
      hasCover: true,
    });

    expect(result).toContain('id="cover"');
    expect(result).toContain('href="cover.xhtml"');
    expect(result).toContain('id="cover-image"');
    expect(result).toContain('href="images/cover.jpg"');
    expect(result).toContain('properties="cover-image"');
  });

  it('includes cover in spine when hasCover is true', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
      hasCover: true,
    });

    expect(result).toContain('<itemref idref="cover"/>');
  });

  it('does not include cover items when hasCover is false', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
      hasCover: false,
    });

    expect(result).not.toContain('id="cover"');
    expect(result).not.toContain('id="cover-image"');
    expect(result).not.toContain('<itemref idref="cover"/>');
  });

  it('does not include cover items by default', () => {
    const result = generateContentOpfMultiChapter({
      uuid: 'test-uuid',
      metadata: mockMetadata,
      chapters: mockChapters,
    });

    expect(result).not.toContain('id="cover-image"');
  });
});
