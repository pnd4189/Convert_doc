/**
 * DOCX Processor - Convert DOCX files to HTML using mammoth
 */

import mammoth from 'mammoth';

export interface DocxProcessResult {
  html: string;
  messages: string[];
}

/**
 * Convert DOCX file to HTML using mammoth
 * Maps common DOCX heading styles to semantic HTML headings
 */
export async function processDocx(file: File): Promise<DocxProcessResult> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        // Map DOCX styles to semantic HTML
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
      ],
    }
  );

  return {
    html: result.value,
    messages: result.messages.map((m) => m.message),
  };
}

/**
 * Batch process multiple DOCX files to HTML
 * @param files - Array of DOCX files
 * @returns Array of HTML strings
 */
export async function batchProcessDocx(files: File[]): Promise<string[]> {
  const htmls: string[] = [];

  for (const file of files) {
    const result = await processDocx(file);
    htmls.push(result.html);
  }

  return htmls;
}
