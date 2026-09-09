import { Response } from 'express';
import { ModelConfiguration } from '../models/ModelConfiguration';
import { AuthRequest } from '../middleware/auth';

export const getModels = async (_req: AuthRequest, res: Response): Promise<void> => {
  const models = await ModelConfiguration.find({ isEnabled: true }).sort({ priority: -1, category: 1 });
  res.json({ success: true, data: { models } });
};

export const getAllModels = async (_req: AuthRequest, res: Response): Promise<void> => {
  const models = await ModelConfiguration.find({}).sort({ priority: -1 });
  res.json({ success: true, data: { models } });
};

export const updateModel = async (req: AuthRequest, res: Response): Promise<void> => {
  const model = await ModelConfiguration.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!model) { res.status(404).json({ success: false, message: 'Model not found' }); return; }
  res.json({ success: true, data: { model } });
};

export const getModelHealth = async (_req: AuthRequest, res: Response): Promise<void> => {
  const models = await ModelConfiguration.find({}).sort({ priority: -1 });

  const health = models.map(m => {
    const totalCalls = m.usageCount + m.errorCount;
    const successRate = totalCalls > 0 ? Math.round(((m.usageCount) / totalCalls) * 100) : 100;
    const uptime24h = m.last24hCalls + m.last24hErrors > 0
      ? Math.round((m.last24hCalls / (m.last24hCalls + m.last24hErrors)) * 100)
      : m.isAvailable ? 100 : 0;

    return {
      _id: m._id,
      name: m.name,
      modelId: m.modelId,
      category: m.category,
      provider: m.provider,
      isEnabled: m.isEnabled,
      isAvailable: m.isAvailable,
      usageCount: m.usageCount,
      errorCount: m.errorCount,
      fallbackCount: m.fallbackCount,
      successRate,
      uptime24h,
      avgLatencyMs: m.avgLatencyMs || 0,
      recentLatencies: m.recentLatencies || [],
      last24hCalls: m.last24hCalls,
      last24hErrors: m.last24hErrors,
      lastSuccessAt: m.lastSuccessAt,
      lastCheckedAt: m.lastCheckedAt,
    };
  });

  // Overall system health summary
  const totalUsage = models.reduce((sum, m) => sum + m.usageCount, 0);
  const totalErrors = models.reduce((sum, m) => sum + m.errorCount, 0);
  const totalFallbacks = models.reduce((sum, m) => sum + m.fallbackCount, 0);
  const activeModels = models.filter(m => m.isEnabled && m.isAvailable).length;
  const overallSuccessRate = (totalUsage + totalErrors) > 0
    ? Math.round((totalUsage / (totalUsage + totalErrors)) * 100)
    : 100;

  res.json({
    success: true,
    data: {
      health,
      summary: {
        totalModels: models.length,
        activeModels,
        totalUsage,
        totalErrors,
        totalFallbacks,
        overallSuccessRate,
      },
    },
  });
};