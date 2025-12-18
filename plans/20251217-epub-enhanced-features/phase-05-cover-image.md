# Phase 5: Cover Image

**Parent:** [plan.md](plan.md)
**Depends on:** Phase 1
**Status:** Pending

---

## Overview

Add optional cover image with auto resize/crop to 1600x2560px (5:8 ratio).

## Requirements

- Accept JPG, PNG, WebP input
- Auto center-crop to 5:8 ratio
- Resize to 1600x2560px
- Output as JPEG (quality 0.8)
- Add to EPUB structure

---

## EPUB Cover Structure

```
OEBPS/
├── cover.xhtml        # Cover page
└── images/
    └── cover.jpg      # Processed image
```

---

## Implementation Steps

### 1. Create cover-handler.ts

```typescript
// src/lib/epub/cover-handler.ts

export interface CoverConfig {
  targetWidth: number;   // 1600
  targetHeight: number;  // 2560
  quality: number;       // 0.8
}

const DEFAULT_CONFIG: CoverConfig = {
  targetWidth: 1600,
  targetHeight: 2560,
  quality: 0.8,
};

export async function processCoverImage(
  file: File | Blob,
  config: CoverConfig = DEFAULT_CONFIG
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const blob = cropAndResize(img, config);
      resolve(blob);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

function cropAndResize(img: HTMLImageElement, config: CoverConfig): Blob {
  const { targetWidth, targetHeight, quality } = config;
  const targetRatio = targetWidth / targetHeight; // 0.625

  const sourceRatio = img.width / img.height;
  let cropX = 0, cropY = 0, cropWidth = img.width, cropHeight = img.height;

  if (sourceRatio > targetRatio) {
    // Source wider than target - crop sides
    cropWidth = img.height * targetRatio;
    cropX = (img.width - cropWidth) / 2;
  } else {
    // Source taller than target - crop top/bottom
    cropHeight = img.width / targetRatio;
    cropY = (img.height - cropHeight) / 2;
  }

  // Create canvas and draw
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    img,
    cropX, cropY, cropWidth, cropHeight, // Source
    0, 0, targetWidth, targetHeight      // Destination
  );

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      quality
    );
  });
}
```

### 2. Create cover.xhtml template

```typescript
// In templates.ts
export function generateCoverXhtml(language: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${language}">
<head>
  <title>Cover</title>
  <style>
    body { margin: 0; padding: 0; }
    img { width: 100%; height: auto; }
  </style>
</head>
<body>
  <img src="images/cover.jpg" alt="Cover"/>
</body>
</html>`;
}
```

### 3. Update content.opf

When cover exists, add:
```xml
<!-- In metadata -->
<meta name="cover" content="cover-image"/>

<!-- In manifest -->
<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>

<!-- In spine (first item) -->
<itemref idref="cover"/>
```

### 4. Update index.ts

- Check if coverImage provided
- Process with `processCoverImage()`
- Add cover.xhtml and images/cover.jpg to zip

---

## Related Files

| File | Action |
|------|--------|
| src/lib/epub/cover-handler.ts | Create |
| src/lib/epub/templates.ts | Update |
| src/lib/epub/index.ts | Update |

---

## Success Criteria

- [ ] Cover displays in Kindle library
- [ ] Cover displays in Kobo
- [ ] Any aspect ratio input works
- [ ] Output always 1600x2560px JPEG
