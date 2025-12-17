/**
 * EPUB Generator - Create EPUB files from text content
 * Pure browser implementation using JSZip (no Node.js dependencies)
 */

import JSZip from 'jszip';

export interface EpubOptions {
  title: string;
  author?: string;
  content: string;
}

export interface EpubChapter {
  title: string;
  content: string;
}

/**
 * Generate EPUB from text content
 * Creates a valid EPUB 2.0 structure
 */
export async function generateEpub(options: EpubOptions): Promise<Blob> {
  const { title, author = 'Unknown', content } = options;
  const uuid = generateUUID();

  const zip = new JSZip();

  // mimetype must be first and uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // OEBPS/content.opf
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>vi</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="content"/>
  </spine>
</package>`);

  // OEBPS/toc.ncx
  zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
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
</ncx>`);

  // OEBPS/style.css
  zip.file('OEBPS/style.css', `body {
  font-family: Georgia, serif;
  line-height: 1.6;
  margin: 1em;
}
h1 {
  text-align: center;
  margin-bottom: 1em;
}
p {
  text-indent: 1em;
  margin: 0.5em 0;
}`);

  // OEBPS/content.xhtml
  const htmlContent = textToHtml(content);
  zip.file('OEBPS/content.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
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
</html>`);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return blob;
}

/**
 * Generate EPUB with multiple chapters
 */
export async function generateEpubWithChapters(
  title: string,
  chapters: EpubChapter[],
  author: string = 'Unknown'
): Promise<Blob> {
  // Combine all chapters into single content for simplicity
  const combinedContent = chapters
    .map(ch => `${ch.title}\n\n${ch.content}`)
    .join('\n\n---\n\n');

  return generateEpub({
    title,
    author,
    content: combinedContent,
  });
}

// Helper functions
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function textToHtml(text: string): string {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs
    .map(p => `<p>${escapeXml(p.replace(/\n/g, '<br/>'))}</p>`)
    .join('\n');
}
