# EPUB Enhanced Features - Implementation Plan

**Date:** 2025-12-17
**Status:** Planning
**Brainstorm:** [brainstorm-20251217-epub-enhanced-features.md](../reports/brainstorm-20251217-epub-enhanced-features.md)

---

## Overview

Enhance EPUB generator with multi-chapter support, proper TOC navigation, cover images, and extended metadata.

## Current State

- `src/lib/epub-generator.ts` - Monolithic, single-chapter EPUB 2.0
- `src/components/tab-merge-epub/step-export.tsx` - Basic export UI

## Target State

- Modular `src/lib/epub/` with separate concerns
- Multi-chapter EPUB with hyperlinked TOC
- Cover image with auto-resize (1600x2560px)
- Chapter headers: Title > Author > Translator > Chapter

---

## Implementation Phases

| Phase | Name | Status | File |
|-------|------|--------|------|
| 1 | Modular Refactor | Pending | [phase-01-modular-refactor.md](phase-01-modular-refactor.md) |
| 2 | Chapter Detection | Pending | [phase-02-chapter-detection.md](phase-02-chapter-detection.md) |
| 3 | Multi-Chapter EPUB | Pending | [phase-03-multi-chapter-epub.md](phase-03-multi-chapter-epub.md) |
| 4 | TOC Generation | Pending | [phase-04-toc-generation.md](phase-04-toc-generation.md) |
| 5 | Cover Image | Pending | [phase-05-cover-image.md](phase-05-cover-image.md) |
| 6 | UI Updates | Pending | [phase-06-ui-updates.md](phase-06-ui-updates.md) |

---

## Research

- [researcher-01-epub-structure.md](research/researcher-01-epub-structure.md)
- [researcher-02-cover-image-processing.md](research/researcher-02-cover-image-processing.md)

---

## Dependencies

- JSZip (existing)
- file-saver (existing)
- No new packages required (Canvas API is browser-native)

---

## Success Criteria

- [ ] EPUB opens in Kindle, Kobo, Apple Books
- [ ] TOC hyperlinks navigate correctly
- [ ] Cover displays on all e-readers
- [ ] Chapter headers show metadata
- [ ] Auto-detection works for standard chapter formats
