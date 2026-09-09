import axios from 'axios';
import logger from '../../utils/logger';

// OpenRouter doesn't universally support embeddings across all free models,
// so we use a free embedding-capable model when available, with a deterministic
// fallback (simple hashing-based pseudo-embedding) so RAG never hard-fails.

const EMBEDDING_MODEL = 'nomic-ai/nomic-embed-text-v1.5'; // adjust if OpenRouter changes availability
const EMBEDDING_DIM = 384;

// Deterministic fallback embedding — bag-of-words hashed into fixed vector.
// Not as accurate as a real embedding model, but keeps RAG functional with zero cost
// and zero external dependency if the embedding endpoint is unavailable.
const fallbackEmbedding = (text: string): number[] => {
  const vec = new Array(EMBEDDING_DIM).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) >>> 0;
    }
    vec[hash % EMBEDDING_DIM] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) return fallbackEmbedding(text);

  try {
    const response = await axios.post(
      `${baseUrl}/embeddings`,
      { model: EMBEDDING_MODEL, input: text.substring(0, 8000) },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    return response.data.data[0].embedding;
  } catch (error) {
    logger.warn('Embedding API unavailable, using fallback hashing embedding:', (error as Error).message);
    return fallbackEmbedding(text);
  }
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};