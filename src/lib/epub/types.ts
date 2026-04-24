/**
 * EPUB Types - Interfaces for EPUB generation
 */

/** Metadata for EPUB generation */
export interface EpubMetadata {
  title: string;
  author?: string;
  translator?: string;
  language?: string;
  coverImage?: File | Blob | null;
}

/** Chapter structure for multi-chapter EPUB */
export interface EpubChapter {
  index: number;
  title: string;
  content: string;
}

/** Configuration for cover image processing */
export interface CoverConfig {
  targetWidth: number;
  targetHeight: number;
  quality: number;
}

/** Default cover configuration: 1600x2560px at 80% quality */
export const DEFAULT_COVER_CONFIG: CoverConfig = {
  targetWidth: 1600,
  targetHeight: 2560,
  quality: 0.8,
};
