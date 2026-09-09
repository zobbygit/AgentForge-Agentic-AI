import fs from 'fs/promises';
import logger from '../../utils/logger';

// Lightweight extraction — no heavy PDF libs required for txt/md/csv/json.
// For PDFs we do a best-effort raw text pull; for full PDF parsing accuracy,
// swap in 'pdf-parse' later if needed (kept out to avoid extra native deps).
export const extractText = async (filePath: string, mimeType: string): Promise<string> => {
  try {
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'text/csv' ||
      mimeType === 'text/markdown'
    ) {
      const buffer = await fs.readFile(filePath, 'utf-8');
      return buffer;
    }

    if (mimeType === 'application/pdf') {
      // Best-effort: strip binary noise, keep readable ASCII runs.
      // This is intentionally dependency-free; swap for 'pdf-parse' for production accuracy.
      const buffer = await fs.readFile(filePath, 'latin1');
      const matches = buffer.match(/[\x20-\x7E]{4,}/g) || [];
      return matches.join(' ').replace(/\s+/g, ' ').trim();
    }

    // Unsupported binary type (images, docx, etc.) — return empty, caller handles gracefully
    logger.warn(`No text extractor for mimeType: ${mimeType}`);
    return '';
  } catch (error) {
    logger.error('Text extraction failed:', error);
    return '';
  }
};

// Split text into overlapping chunks for embedding
export const chunkText = (text: string, chunkSize = 800, overlap = 100): string[] => {
  if (!text || text.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end).trim();
    if (chunk.length > 20) chunks.push(chunk);
    start += chunkSize - overlap;
  }

  return chunks;
};