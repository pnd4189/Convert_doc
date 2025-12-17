/**
 * ZIP Builder - Create ZIP archives from multiple files
 * Uses JSZip for browser-compatible ZIP creation
 */

import JSZip from 'jszip';

export interface ZipFile {
  name: string;
  content: string | Blob;
}

export type ProgressCallback = (percent: number) => void;

/**
 * Create a ZIP archive from multiple files
 */
export async function createZip(
  files: ZipFile[],
  onProgress?: ProgressCallback
): Promise<Blob> {
  const zip = new JSZip();

  // Add files to ZIP
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    zip.file(file.name, file.content);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 50)); // First 50% for adding files
    }
  }

  // Generate ZIP with progress
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        // Second 50% for compression
        onProgress(50 + Math.round(metadata.percent / 2));
      }
    }
  );

  return blob;
}

/**
 * Extract files from a ZIP archive
 */
export async function extractZip(
  zipBlob: Blob,
  onProgress?: ProgressCallback
): Promise<ZipFile[]> {
  const zip = await JSZip.loadAsync(zipBlob);
  const files: ZipFile[] = [];
  const entries = Object.entries(zip.files);
  let processed = 0;

  for (const [name, file] of entries) {
    if (!file.dir) {
      const content = await file.async('string');
      files.push({ name, content });
    }
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / entries.length) * 100));
    }
  }

  return files;
}
