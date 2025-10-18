import { AiExtractorService } from '@extractiq/core';
import { AiProvider, AiModelConfig, getAiModelConfig } from './types';
import { OpenAIExtractorService } from './providers/openai-extractor.service';
import { AnthropicExtractorService } from './providers/anthropic-extractor.service';

/**
 * Factory for creating AI Extractor services
 * Automatically selects the correct provider based on configuration
 */
export class AiExtractorFactory {
  /**
   * Create an AI extractor service based on environment configuration
   */
  static create(): AiExtractorService {
    const config = getAiModelConfig();
    return this.createFromConfig(config);
  }

  /**
   * Create an AI extractor service with explicit configuration
   */
  static createFromConfig(config: AiModelConfig): AiExtractorService {
    switch (config.provider) {
      case AiProvider.OPENAI:
        return new OpenAIExtractorService(config);

      case AiProvider.ANTHROPIC:
        return new AnthropicExtractorService(config);

      case AiProvider.OLLAMA:
        // TODO: Implement Ollama provider for local models
        throw new Error('Ollama provider not yet implemented');

      case AiProvider.GROQ:
        // TODO: Implement Groq provider (uses OpenAI-compatible API)
        // Could extend OpenAIExtractorService with different baseURL
        throw new Error('Groq provider not yet implemented');

      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  /**
   * Create an AI extractor for a specific provider with custom model
   */
  static createCustom(provider: AiProvider, model: string, apiKey?: string): AiExtractorService {
    const config: AiModelConfig = {
      provider,
      model,
      apiKey,
      temperature: 0.1,
      maxTokens: 4096,
      timeout: 60000,
    };

    return this.createFromConfig(config);
  }
}
