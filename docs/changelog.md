# Changelog

## 2025-12-18
- **Phase 1: Modular Refactor** completed.
  - Extracted monolithic `epub-generator.ts` into a modular structure under `src/lib/epub/`.
  - Established `src/lib/epub/types.ts`, `utils.ts`, `templates.ts`, `styles.ts`, and `index.ts`.
  - Maintained backward compatibility for `generateEpub` and prepared for multi-chapter support.
