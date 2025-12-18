/**
 * Cover Handler - Process cover images for EPUB
 * Crop and resize to standard e-reader format (1600x2560px, 5:8 ratio)
 */

import type { CoverConfig } from './types';
import { DEFAULT_COVER_CONFIG } from './types';

/**
 * Process cover image: center-crop to 5:8 ratio, resize to target dimensions
 * @param file Input image (JPG, PNG, WebP)
 * @param config Optional config for dimensions and quality
 * @returns JPEG blob ready for EPUB
 */
export async function processCoverImage(
  file: File | Blob,
  config: CoverConfig = DEFAULT_COVER_CONFIG
): Promise<Blob> {
  const img = await loadImage(file);
  return cropAndResize(img, config);
}

/**
 * Load image from File/Blob into HTMLImageElement
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load cover image'));
    };

    img.src = url;
  });
}

/**
 * Center-crop and resize image to target dimensions
 * Uses canvas for pure browser implementation
 */
function cropAndResize(img: HTMLImageElement, config: CoverConfig): Promise<Blob> {
  const { targetWidth, targetHeight, quality } = config;
  const targetRatio = targetWidth / targetHeight; // 0.625 for 5:8

  const sourceRatio = img.width / img.height;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = img.width;
  let cropHeight = img.height;

  if (sourceRatio > targetRatio) {
    // Source wider than target - crop sides (center)
    cropWidth = img.height * targetRatio;
    cropX = (img.width - cropWidth) / 2;
  } else {
    // Source taller than target - crop top/bottom (center)
    cropHeight = img.width / targetRatio;
    cropY = (img.height - cropHeight) / 2;
  }

  // Create canvas and draw cropped/resized image
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

  ctx.drawImage(
    img,
    cropX, cropY, cropWidth, cropHeight, // Source rect
    0, 0, targetWidth, targetHeight       // Destination rect
  );

  // Convert canvas to JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create cover image blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}
