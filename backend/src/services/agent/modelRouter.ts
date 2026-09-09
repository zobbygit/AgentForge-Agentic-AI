import axios from 'axios';
import { ModelConfiguration, ModelCategory } from '../../models/ModelConfiguration';
import { AuditLog } from '../../models/AuditLog';
import { discoverFreeModels, resetDiscoveryCache } from './modelDiscovery';
import logger from '../../utils/logger';

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export const selectModelForTask = async (
  taskType: string,
  preferredCategory?: string
): Promise<{ modelId: string; category: string; reason: string }> => {
  await discoverFreeModels();

  const lowerType = taskType.toLowerCase();
  let targetCategory: ModelCategory | null = null;
  let reason = 'General purpose task';

  if (preferredCategory === 'CODING' || lowerType.includes('code') || lowerType.includes('program') || lowerType.includes('debug')) {
    targetCategory = ModelCategory.CODING; reason = 'Code-focused task';
  } else if (preferredCategory === 'REASONING' || lowerType.includes('analyze') || lowerType.includes('research') || lowerType.includes('complex')) {
    targetCategory = ModelCategory.REASONING; reason = 'Complex reasoning required';
  } else if (preferredCategory === 'FAST' || lowerType.includes('quick') || lowerType.includes('simple') || lowerType.includes('classify')) {
    targetCategory = ModelCategory.FAST; reason = 'Simple task — fast model';
  } else if (lowerType.includes('document') || lowerType.includes('pdf') || lowerType.includes('long')) {
    targetCategory = ModelCategory.LONG_CONTEXT; reason = 'Long context task';
  }

  const baseQuery = { isEnabled: true, isAvailable: true };

  if (targetCategory) {
    const preferred = await ModelConfiguration.findOne({ ...baseQuery, category: targetCategory }).sort({ priority: -1 });
    if (preferred) return { modelId: preferred.modelId, category: preferred.category, reason };
  }

  const any = await ModelConfiguration.findOne(baseQuery).sort({ priority: -1, usageCount: 1 });
  if (any) return { modelId: any.modelId, category: any.category, reason: reason + ' (category fallback)' };

  throw new Error('No free models available. Check your OpenRouter API key.');
};

export const callOpenRouter = async (
  messages: ModelMessage[],
  modelId: string,
  maxTokens = 2000,
  userId?: string
): Promise<ModelResponse> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not set in .env');
  }

  await discoverFreeModels();

  const allAvailable = await ModelConfiguration.find({ isEnabled: true, isAvailable: true })
    .sort({ priority: -1, errorCount: 1 });

  if (allAvailable.length === 0) {
    throw new Error('No free models available. Check your OpenRouter API key and model discovery.');
  }

  const fallbackChain = [
    modelId,
    ...allAvailable.map(m => m.modelId).filter(id => id !== modelId),
  ];

  let lastError: unknown;

  for (let i = 0; i < fallbackChain.length; i++) {
    const currentModel = fallbackChain[i];
       const callStartTime = Date.now();
    try {
      logger.info(`Calling model [${i + 1}/${fallbackChain.length}]: ${currentModel}`);

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        { model: currentModel, messages, max_tokens: maxTokens },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
            'X-Title': 'AgentForge',
          },
          timeout: 60000,
        }
      );

      if (i > 0) {
        logger.warn(`Fallback succeeded: ${modelId} → ${currentModel}`);
        await ModelConfiguration.findOneAndUpdate({ modelId }, { $inc: { fallbackCount: 1 } });
        await AuditLog.create({
          userId, actorType: 'system', action: 'MODEL_FALLBACK',
          resourceType: 'model', resourceId: currentModel,
          metadata: { originalModel: modelId, fallbackModel: currentModel },
          status: 'success',
        });
      }

      const latencyMs = Date.now() - callStartTime;
      const modelDoc = await ModelConfiguration.findOne({ modelId: currentModel });
      const recentLatencies = [...(modelDoc?.recentLatencies || []), latencyMs].slice(-50);
      const avgLatencyMs = Math.round(recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length);

      await ModelConfiguration.findOneAndUpdate(
        { modelId: currentModel },
        {
          $inc: { usageCount: 1, totalLatencyMs: latencyMs, last24hCalls: 1 },
          $set: { lastSuccessAt: new Date(), isAvailable: true, recentLatencies, avgLatencyMs },
        }
      );

       return {
        content: response.data.choices[0].message.content,
        model: currentModel,
        usage: response.data.usage,
      };

    } catch (error: unknown) {
      lastError = error;

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const detail = error.response?.data?.error?.message || error.response?.data?.message || error.message;
        logger.error(`Model ${currentModel} failed [HTTP ${status}]: ${detail}`);

        if (status === 401) {
          throw new Error('OpenRouter API key invalid (401). Fix OPENROUTER_API_KEY in .env');
        }

           if (status === 404) {
          logger.warn(`Model ${currentModel} is gone (404) — disabling in DB`);
          await ModelConfiguration.findOneAndUpdate(
            { modelId: currentModel },
            { $set: { isAvailable: false, isEnabled: false }, $inc: { errorCount: 1, last24hErrors: 1 } }
          );
          resetDiscoveryCache();
        } else {
          await ModelConfiguration.findOneAndUpdate(
            { modelId: currentModel },
            { $inc: { errorCount: 1, last24hErrors: 1 } }
          );
        }
        
      } else {
        logger.error(`Model ${currentModel} non-HTTP error: ${String(error)}`);
        await ModelConfiguration.findOneAndUpdate({ modelId: currentModel }, { $inc: { errorCount: 1 } });
      }

      if (i < fallbackChain.length - 1) {
        logger.info(`Trying next: ${fallbackChain[i + 1]}`);
      }
    }
    
  }

  resetDiscoveryCache();
  throw new Error(`All ${fallbackChain.length} models failed. Last: ${String(lastError)}`);
};

// Rough free-tier cost estimate (always $0 for :free models, but track token volume)
export const estimateCost = (promptTokens: number, completionTokens: number, isFree: boolean): number => {
  if (isFree) return 0;
  // Fallback estimate if a non-free model somehow gets used: ~$0.50/1M tokens blended
  return ((promptTokens + completionTokens) / 1_000_000) * 0.5;
};