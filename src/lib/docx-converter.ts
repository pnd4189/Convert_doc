/**
 * DOCX Converter - Convert between TXT and DOCX formats
 * Uses mammoth for DOCX reading and docx for DOCX writing
 */

import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

/**
 * Read a File as text (for TXT files)
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Read a File as ArrayBuffer
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert DOCX file to plain text
 */
export async function docxToText(file: File): Promise<string> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Convert plain text to DOCX Blob
 */
export async function textToDocx(text: string): Promise<Blob> {
  // Split text into paragraphs
  const paragraphs = text.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun(line)],
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}

/**
 * Detect file type from extension
 */
export function getFileType(filename: string): 'txt' | 'docx' | 'doc' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'txt') return 'txt';
  if (ext === 'docx') return 'docx';
  if (ext === 'doc') return 'doc';
  return 'unknown';
}

/**
 * Read file content based on type
 */
export async function readFileContent(file: File): Promise<string> {
  const fileType = getFileType(file.name);

  if (fileType === 'txt') {
    return readFileAsText(file);
  } else if (fileType === 'docx') {
    return docxToText(file);
  } else if (fileType === 'doc') {
    // .doc format - try to read as text, may not work perfectly
    try {
      return docxToText(file);
    } catch {
      return readFileAsText(file);
    }
  }

  throw new Error(`Định dạng file không được hỗ trợ: ${fileType}`);
}
