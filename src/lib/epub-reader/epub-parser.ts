/**
 * EPUB Parser - Extract content from EPUB files in reading order
 * Supports EPUB 2 and EPUB 3 formats
 */

import JSZip from 'jszip';

export interface EpubXhtmlChapter {
  id: string;
  href: string;
  content: string;
}

export interface EpubContent {
  title: string;
  author?: string;
  chapters: EpubXhtmlChapter[];
}

/**
 * Parse XML string and validate for parse errors
 * @param xml - XML string to parse
 * @param filename - File name for error messages
 * @returns Parsed Document
 * @throws Error if XML is malformed
 */
function parseXml(xml: string, filename: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`Invalid EPUB: malformed XML in ${filename}`);
  }
  return doc;
}

/**
 * Parse EPUB file and extract content in reading order (spine order)
 * @param file - EPUB file to parse
 * @returns Parsed EPUB content with title, author, and chapters
 */
export async function parseEpub(file: File): Promise<EpubContent> {
  const zip = await JSZip.loadAsync(file);

  // 1. Read META-INF/container.xml to find content.opf path
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) {
    throw new Error('Invalid EPUB: missing container.xml');
  }

  const containerDoc = parseXml(containerXml, 'container.xml');
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootfilePath) {
    throw new Error('Invalid EPUB: missing rootfile path');
  }

  // 2. Parse content.opf
  const opfContent = await zip.file(rootfilePath)?.async('string');
  if (!opfContent) {
    throw new Error('Invalid EPUB: missing content.opf');
  }

  const opfDoc = parseXml(opfContent, 'content.opf');
  const opfDir = rootfilePath.includes('/')
    ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1)
    : '';

  // 3. Get metadata (handle both EPUB 2 and EPUB 3 namespaces)
  const title = getMetadataValue(opfDoc, 'title') || 'Untitled';
  const author = getMetadataValue(opfDoc, 'creator') || undefined;

  // 4. Build manifest map (id -> href)
  const manifest = new Map<string, string>();
  opfDoc.querySelectorAll('manifest item').forEach((item) => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) {
      manifest.set(id, href);
    }
  });

  // 5. Get spine order (itemref idref)
  const spineRefs: string[] = [];
  opfDoc.querySelectorAll('spine itemref').forEach((ref) => {
    const idref = ref.getAttribute('idref');
    if (idref) {
      spineRefs.push(idref);
    }
  });

  // 6. Read XHTML files in spine order
  const chapters: EpubXhtmlChapter[] = [];
  for (const idref of spineRefs) {
    const href = manifest.get(idref);
    if (!href) continue;

    // Skip non-content files (NCX, CSS, etc.)
    if (!href.match(/\.(xhtml|html|htm|xml)$/i)) continue;

    const filePath = opfDir + href;
    const xhtmlContent = await zip.file(filePath)?.async('string');
    if (xhtmlContent) {
      chapters.push({ id: idref, href, content: xhtmlContent });
    }
  }

  return { title, author, chapters };
}

/**
 * Get metadata value, handling both EPUB 2 and EPUB 3 namespaces
 */
function getMetadataValue(doc: Document, name: string): string | null {
  // Try EPUB 2 style: <dc:title>
  const dcElement = doc.querySelector(`metadata *|${name}, metadata ${name}`);
  if (dcElement?.textContent) {
    return dcElement.textContent.trim();
  }

  // Try direct selector
  const directElement = doc.querySelector(`metadata > ${name}`);
  if (directElement?.textContent) {
    return directElement.textContent.trim();
  }

  return null;
}
