// Config - exported first to allow validation before other dependencies initialize
export { authConfig } from './config/auth.config';

// Database
export * from './database/drizzle/client';
export * from './database/drizzle/schema';

// Repositories
export { DrizzleDocumentRepository } from './database/repositories/document.repository.impl';
export { DrizzleUserRepository } from './database/repositories/user.repository.impl';

// Mappers
export { DocumentMapper } from './database/mappers/document.mapper';
export { UserMapper } from './database/mappers/user.mapper';

// AI Services
export { OpenAIExtractorService } from './ai/openai/extractor.service.impl';
export { getOpenAIClient, resetOpenAIClient } from './ai/openai/client';

// AI Provider Abstraction (NEW)
export { AiExtractorFactory } from './ai/factory';
export { AiProvider, AiModelConfig, AI_MODELS, getAiModelConfig } from './ai/types';
export { BaseAiExtractorService } from './ai/base/base-extractor.service';
export { OpenAIExtractorService as NewOpenAIExtractorService } from './ai/providers/openai-extractor.service';
// Uncomment when you install @anthropic-ai/sdk:
// export { AnthropicExtractorService } from './ai/providers/anthropic-extractor.service';

// Storage Services
export { LocalFileStorageService } from './storage/local/storage.service.impl';

// Queue Services
export { BullMQQueueService } from './queue/bullmq/queue.service.impl';

// Auth Services
export { BcryptPasswordHasherService } from './auth/password-hasher.service.impl';
export { JwtTokenService } from './auth/token.service.impl';

// Notification Services
export { ConsoleNotificationService } from './events/notification.service.impl';
