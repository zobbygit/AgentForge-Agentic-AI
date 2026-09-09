import { DocumentModel, DocumentStatus } from '../../models/Document';
import { extractText, chunkText } from './textExtractor';
import { generateEmbedding, cosineSimilarity } from './embeddings';
import logger from '../../utils/logger';

export const processDocument = async (documentId: string): Promise<void> => {
  const doc = await DocumentModel.findById(documentId);
  if (!doc) return;

  try {
    doc.status = DocumentStatus.PROCESSING;
    await doc.save();

    const text = await extractText(doc.filePath, doc.mimeType);
    if (!text || text.length < 10) {
      doc.status = DocumentStatus.FAILED;
      doc.error = 'No extractable text found in file';
      await doc.save();
      return;
    }

    doc.extractedText = text.substring(0, 50000); // cap stored raw text
    const rawChunks = chunkText(text);

    const chunks = [];
    for (let i = 0; i < rawChunks.length; i++) {
      const embedding = await generateEmbedding(rawChunks[i]);
      chunks.push({
        chunkIndex: i,
        content: rawChunks[i],
        embedding,
        tokenCount: Math.ceil(rawChunks[i].length / 4),
      });
    }

    doc.chunks = chunks;
    doc.status = DocumentStatus.INDEXED;
    await doc.save();

    logger.info(`Document ${documentId} indexed: ${chunks.length} chunks`);
  } catch (error) {
    logger.error(`Document processing failed for ${documentId}:`, error);
    doc.status = DocumentStatus.FAILED;
    doc.error = error instanceof Error ? error.message : 'Processing failed';
    await doc.save();
  }
};

// Retrieve top-K relevant chunks across a user's (optionally project-scoped) documents
export const retrieveRelevantChunks = async (
  query: string,
  userId: string,
  options: { taskId?: string; projectId?: string; topK?: number } = {}
): Promise<Array<{ content: string; source: string; score: number }>> => {
  const { taskId, projectId, topK = 5 } = options;

  const filter: Record<string, unknown> = { userId, status: DocumentStatus.INDEXED };
  if (taskId) filter.taskId = taskId;
  if (projectId) filter.projectId = projectId;

  const docs = await DocumentModel.find(filter);
  if (docs.length === 0) return [];

  const queryEmbedding = await generateEmbedding(query);

  const scored: Array<{ content: string; source: string; score: number }> = [];
  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      scored.push({ content: chunk.content, source: doc.originalName, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter(s => s.score > 0.15); // relevance floor
};