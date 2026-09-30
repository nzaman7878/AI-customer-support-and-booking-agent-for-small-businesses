import { DocumentChunk } from '@ai-agent/shared';

export interface ChunkOptions {
  chunkSize?: number;      // Words/Tokens per chunk (~500)
  chunkOverlap?: number;   // Overlap words (~50)
  separator?: string;
}

export function chunkText(
  text: string, 
  documentId: string, 
  documentTitle: string, 
  category: string = 'faq',
  options: ChunkOptions = {}
): DocumentChunk[] {
  const { chunkSize = 400, chunkOverlap = 50 } = options;

  // Normalize line endings and whitespace
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  const paragraphs = cleanText.split(/\n\s*\n/);

  const chunks: DocumentChunk[] = [];
  let currentChunkWords: string[] = [];
  let chunkCounter = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).filter(Boolean);
    if (!paragraphWords.length) continue;

    if (currentChunkWords.length + paragraphWords.length > chunkSize) {
      if (currentChunkWords.length > 0) {
        // Emit previous chunk
        chunks.push({
          id: `${documentId}_chunk_${chunkCounter++}`,
          documentId,
          documentTitle,
          content: currentChunkWords.join(' '),
          category,
          chunkIndex: chunkCounter - 1
        });

        // Retain overlap from end of previous chunk
        const overlapStart = Math.max(0, currentChunkWords.length - chunkOverlap);
        currentChunkWords = currentChunkWords.slice(overlapStart);
      }
    }

    currentChunkWords.push(...paragraphWords);
  }

  // Push final remaining words
  if (currentChunkWords.length > 0) {
    chunks.push({
      id: `${documentId}_chunk_${chunkCounter++}`,
      documentId,
      documentTitle,
      content: currentChunkWords.join(' '),
      category,
      chunkIndex: chunkCounter - 1
    });
  }

  return chunks;
}
