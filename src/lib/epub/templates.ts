/**
 * EPUB Templates - XML/HTML template generators
 */

import type { EpubChapter, EpubMetadata } from './types';
import { escapeXml } from './utils';
import { getChapterId } from './chapter-builder';

/** Generate META-INF/container.xml */
export function generateContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

interface ContentOpfParams {
  uuid: string;
  title: string;
  author: string;
  language: string;
}

/** Generate OEBPS/content.opf */
export function generateContentOpf(params: ContentOpfParams): string {
  const { uuid, title, author, language } = params;
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="content"/>
  </spine>
</package>`;
}

interface TocNcxParams {
  uuid: string;
  title: string;
}

/** Generate OEBPS/toc.ncx */
export function generateTocNcx(params: TocNcxParams): string {
  const { uuid, title } = params;
  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <navMap>
    <navPoint id="content" playOrder="1">
      <navLabel>
        <text>${escapeXml(title)}</text>
      </navLabel>
      <content src="content.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;
}

interface ContentXhtmlParams {
  title: string;
  htmlContent: string;
}

/** Generate OEBPS/content.xhtml */
export function generateContentXhtml(params: ContentXhtmlParams): string {
  const { title, htmlContent } = params;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${htmlContent}
</body>
</html>`;
}

interface MultiChapterOpfParams {
  uuid: string;
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  hasCover?: boolean;
}

/**
 * Generate content.opf for multi-chapter EPUB
 * Creates manifest and spine entries for each chapter
 * Includes both NCX (EPUB 2) and nav (EPUB 3) TOC
 * Optionally includes cover image
 */
export function generateContentOpfMultiChapter(params: MultiChapterOpfParams): string {
  const { uuid, metadata, chapters, hasCover = false } = params;
  const { title, author = 'Unknown', language = 'vi' } = metadata;

  // Generate manifest items for each chapter
  const manifestItems = chapters
    .map((ch) => {
      const id = getChapterId(ch.index);
      return `    <item id="${id}" href="chapters/${id}.xhtml" media-type="application/xhtml+xml"/>`;
    })
    .join('\n');

  // Generate spine itemrefs for reading order
  const spineItems = chapters
    .map((ch) => `    <itemref idref="${getChapterId(ch.index)}"/>`)
    .join('\n');

  // Cover items (only if cover exists)
  const coverMeta = hasCover ? '\n    <meta name="cover" content="cover-image"/>' : '';
  const coverManifest = hasCover
    ? `\n    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>\n    <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>`
    : '';
  const coverSpine = hasCover ? '\n    <itemref idref="cover"/>' : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>${coverMeta}
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>${coverManifest}
${manifestItems}
  </manifest>
  <spine toc="ncx">${coverSpine}
    <itemref idref="nav"/>
${spineItems}
  </spine>
</package>`;
}

interface MultiChapterTocParams {
  uuid: string;
  title: string;
  chapters: EpubChapter[];
}

/**
 * Generate toc.ncx for multi-chapter EPUB
 * Creates navPoints for chapter navigation
 */
export function generateTocNcxMultiChapter(params: MultiChapterTocParams): string {
  const { uuid, title, chapters } = params;

  const navPoints = chapters
    .map((ch, i) => {
      const id = getChapterId(ch.index);
      return `    <navPoint id="${id}" playOrder="${i + 1}">
      <navLabel>
        <text>${escapeXml(ch.title)}</text>
      </navLabel>
      <content src="chapters/${id}.xhtml"/>
    </navPoint>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;
}

interface TocXhtmlParams {
  title: string;
  chapters: EpubChapter[];
  language?: string;
}

/**
 * Generate toc.xhtml for EPUB 3.0 navigation
 * HTML-based TOC with clickable links
 */
export function generateTocXhtml(params: TocXhtmlParams): string {
  const { title, chapters, language = 'vi' } = params;

  const items = chapters
    .map((ch) => {
      const id = getChapterId(ch.index);
      return `      <li><a href="chapters/${id}.xhtml">${escapeXml(ch.title)}</a></li>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}">
<head>
  <meta charset="UTF-8"/>
  <title>Mục Lục - ${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1 class="toc-title">Mục Lục</h1>
    <ol class="toc-list">
${items}
    </ol>
  </nav>
</body>
</html>`;
}

interface CoverXhtmlParams {
  language?: string;
}

/**
 * Generate cover.xhtml - cover page with image
 */
export function generateCoverXhtml(params: CoverXhtmlParams = {}): string {
  const { language = 'vi' } = params;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${language}">
<head>
  <meta charset="UTF-8"/>
  <title>Cover</title>
  <style>
    body { margin: 0; padding: 0; text-align: center; }
    img { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body>
  <img src="images/cover.jpg" alt="Cover"/>
</body>
</html>`;
}
