import axios from 'axios';
import { ModelConfiguration, ModelCategory } from '../../models/ModelConfiguration';
import logger from '../../utils/logger';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let lastDiscoveryAt = 0;
let isDiscovering = false;

export const resetDiscoveryCache = (): void => {
  lastDiscoveryAt = 0;
};

const categorizeModel = (modelId: string, description = ''): ModelCategory => {
  const id = modelId.toLowerCase();
  const desc = description.toLowerCase();
  if (id.includes('coder') || id.includes('code') || id.includes('starcoder') || id.includes('codellama') || id.includes('devstral')) return ModelCategory.CODING;
  if (id.includes('r1') || id.includes('o1') || id.includes('reasoning') || id.includes('thinker') || desc.includes('reasoning')) return ModelCategory.REASONING;
  if (id.includes('128k') || id.includes('1m') || id.includes('long') || id.includes('phi-3-medium')) return ModelCategory.LONG_CONTEXT;
  if (id.includes('7b') || id.includes('8b') || id.includes('mini') || id.includes('flash') || id.includes('haiku') || id.includes('small')) return ModelCategory.FAST;
  return ModelCategory.GENERAL;
};

const isFreeModel = (pricing: Record<string, string | number> | undefined): boolean => {
  if (!pricing) return false;
  const prompt = parseFloat(String(pricing.prompt ?? '1'));
  const completion = parseFloat(String(pricing.completion ?? '1'));
  return prompt === 0 && completion === 0;
};

// Exclude moderation, embedding, safety, and non-chat models from the pool
const BLOCKED_KEYWORDS = ['moderation', 'guard', 'safety', 'embed', 'rerank', 'whisper', 'tts', 'vision-only', 'inkling'];

const isUsableChatModel = (modelId: string, architecture?: { modality?: string }): boolean => {
  const id = modelId.toLowerCase();
  if (BLOCKED_KEYWORDS.some(kw => id.includes(kw))) return false;
  // Must support text output — reject audio/image-only models
  if (architecture?.modality && !architecture.modality.includes('text')) return false;
  return true;
};

export const discoverFreeModels = async (): Promise<void> => {
  if (isDiscovering) return;
  if (Date.now() - lastDiscoveryAt < CACHE_TTL_MS) return;

  isDiscovering = true;
  logger.info('Discovering free models from OpenRouter...');

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

    const { data } = await axios.get(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 15000,
    });

 const allModels: any[] = data.data || [];
    const freeModels = allModels.filter(m =>
      isFreeModel(m.pricing) && isUsableChatModel(m.id, m.architecture)
    );

    logger.info(`Catalog: ${allModels.length} total, ${freeModels.length} free`);

    // Disable all first — re-enable only what's actually free right now
    await ModelConfiguration.updateMany({}, { $set: { isEnabled: false, isAvailable: false } });

    for (const model of freeModels) {
      const category = categorizeModel(model.id, model.description || '');
      const contextWindow = model.context_length || 8192;

      await ModelConfiguration.findOneAndUpdate(
        { modelId: model.id },
        {
          $set: {
            name: model.name || model.id,
            modelId: model.id,
            provider: (model.id as string).split('/')[0] || 'unknown',
            category,
            isFree: true,
            isEnabled: true,
            isAvailable: true,
            contextWindow,
            description: model.description || '',
            lastCheckedAt: new Date(),
            priority: Math.min(Math.floor(contextWindow / 10000), 10),
          },
          $setOnInsert: {
            usageCount: 0,
            errorCount: 0,
            fallbackCount: 0,
            isPrimary: false,
            isFallback: false,
          },
        },
        { upsert: true }
      );
    }

    lastDiscoveryAt = Date.now();
    logger.info(`Discovery done: ${freeModels.length} free models available`);

  } catch (error) {
    logger.error('Model discovery failed — keeping existing DB state:', error);
  } finally {
    isDiscovering = false;
  }
};

export const initModelDiscovery = async (): Promise<void> => {
  await discoverFreeModels();
};