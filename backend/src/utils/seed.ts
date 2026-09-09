import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';
import { ModelConfiguration, ModelCategory } from '../models/ModelConfiguration';
import { AuditLog } from '../models/AuditLog';
import logger from './logger';

const FREE_MODELS = [
  { name: 'Llama 3.3 70B', modelId: 'meta-llama/llama-3.3-70b-instruct:free', provider: 'Meta', category: ModelCategory.GENERAL, isFree: true, isPrimary: true, priority: 10, contextWindow: 131072, description: 'High-quality general purpose model' },
  { name: 'DeepSeek R1', modelId: 'deepseek/deepseek-r1:free', provider: 'DeepSeek', category: ModelCategory.REASONING, isFree: true, isPrimary: true, priority: 9, contextWindow: 65536, description: 'Advanced reasoning model' },
  { name: 'DeepSeek Chat', modelId: 'deepseek/deepseek-chat:free', provider: 'DeepSeek', category: ModelCategory.GENERAL, isFree: true, isFallback: true, priority: 8, contextWindow: 65536, description: 'Fast conversational model' },
  { name: 'Qwen 2.5 Coder 32B', modelId: 'qwen/qwen-2.5-coder-32b-instruct:free', provider: 'Qwen', category: ModelCategory.CODING, isFree: true, isPrimary: true, priority: 9, contextWindow: 32768, description: 'Specialized coding model' },
  { name: 'Gemma 3 27B', modelId: 'google/gemma-3-27b-it:free', provider: 'Google', category: ModelCategory.GENERAL, isFree: true, isFallback: true, priority: 7, contextWindow: 131072, description: 'Google general purpose model' },
  { name: 'Mistral 7B', modelId: 'mistralai/mistral-7b-instruct:free', provider: 'Mistral', category: ModelCategory.FAST, isFree: true, isPrimary: true, priority: 8, contextWindow: 8192, description: 'Fast lightweight model' },
  { name: 'Phi-3 Medium 128K', modelId: 'microsoft/phi-3-medium-128k-instruct:free', provider: 'Microsoft', category: ModelCategory.LONG_CONTEXT, isFree: true, isFallback: true, priority: 6, contextWindow: 131072, description: 'Long context window model' },
];

const seed = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  await mongoose.connect(uri);
  logger.info('Connected to MongoDB for seeding');

  // Create admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@agentforge.ai';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ email: adminEmail, password: adminPassword, name: 'Admin', role: UserRole.ADMIN, isEmailVerified: true });
    logger.info(`Admin created: ${adminEmail}`);
  } else {
    logger.info('Admin already exists');
  }

  // Create demo user
  const demoEmail = process.env.DEMO_EMAIL || 'demo@agentforge.ai';
  const demoPassword = process.env.DEMO_PASSWORD || 'Demo@123456';
  const existingDemo = await User.findOne({ email: demoEmail });
  if (!existingDemo) {
    await User.create({ email: demoEmail, password: demoPassword, name: 'Demo User', role: UserRole.USER, isEmailVerified: true });
    logger.info(`Demo user created: ${demoEmail}`);
  }

  // Seed model configurations
  for (const model of FREE_MODELS) {
    await ModelConfiguration.findOneAndUpdate(
      { modelId: model.modelId },
      { $setOnInsert: { ...model, isEnabled: true, usageCount: 0, errorCount: 0, fallbackCount: 0 } },
      { upsert: true }
    );
  }
  logger.info(`${FREE_MODELS.length} model configurations seeded`);

  // Seed audit log entry
  await AuditLog.create({
    actorType: 'system',
    action: 'SYSTEM_SEEDED',
    resourceType: 'system',
    metadata: { version: '1.0.0', modelsSeeded: FREE_MODELS.length },
    status: 'success',
  });

  logger.info('Seeding complete!');
  logger.info(`Admin: ${adminEmail} / ${adminPassword}`);
  logger.info(`Demo: ${demoEmail} / ${demoPassword}`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
