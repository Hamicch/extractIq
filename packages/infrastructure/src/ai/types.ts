/**
 * AI Provider abstraction types
 * Makes it easy to swap between OpenAI, Anthropic, local models, etc.
 */

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama', // Local models
  GROQ = 'groq', // Fast inference
}

export interface AiModelConfig {
  provider: AiProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

/**
 * Provider-specific model configurations
 */
export const AI_MODELS = {
  // OpenAI models (cost-effective)
  OPENAI_GPT4O_MINI: {
    provider: AiProvider.OPENAI,
    model: 'gpt-4o-mini',
    temperature: 0.1,
    maxTokens: 4096,
  } as AiModelConfig,

  OPENAI_GPT4O: {
    provider: AiProvider.OPENAI,
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 4096,
  } as AiModelConfig,

  // Anthropic models
  ANTHROPIC_CLAUDE_SONNET: {
    provider: AiProvider.ANTHROPIC,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.1,
    maxTokens: 4096,
  } as AiModelConfig,

  ANTHROPIC_CLAUDE_HAIKU: {
    provider: AiProvider.ANTHROPIC,
    model: 'claude-3-5-haiku-20241022',
    temperature: 0.1,
    maxTokens: 4096,
  } as AiModelConfig,

  // Ollama (local models)
  OLLAMA_LLAMA3: {
    provider: AiProvider.OLLAMA,
    model: 'llama3',
    baseUrl: 'http://localhost:11434',
    temperature: 0.1,
    maxTokens: 4096,
  } as AiModelConfig,

  // Groq (fast inference)
  GROQ_LLAMA3_70B: {
    provider: AiProvider.GROQ,
    model: 'llama-3.1-70b-versatile',
    temperature: 0.1,
    maxTokens: 4096,
  } as AiModelConfig,
} as const;

/**
 * Get AI model config from environment or default
 */
export function getAiModelConfig(): AiModelConfig {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase() as AiProvider;
  const model = process.env.AI_MODEL;

  // If specific model is configured, use it
  if (model) {
    return {
      provider,
      model,
      apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
      baseUrl: process.env.AI_BASE_URL,
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
      timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
    };
  }

  // Otherwise, use default based on provider
  switch (provider) {
    case AiProvider.OPENAI:
      return {
        ...AI_MODELS.OPENAI_GPT4O_MINI,
        apiKey: process.env.OPENAI_API_KEY,
      };
    case AiProvider.ANTHROPIC:
      return {
        ...AI_MODELS.ANTHROPIC_CLAUDE_HAIKU,
        apiKey: process.env.ANTHROPIC_API_KEY,
      };
    case AiProvider.OLLAMA:
      return AI_MODELS.OLLAMA_LLAMA3;
    case AiProvider.GROQ:
      return {
        ...AI_MODELS.GROQ_LLAMA3_70B,
        apiKey: process.env.GROQ_API_KEY,
      };
    default:
      return {
        ...AI_MODELS.OPENAI_GPT4O_MINI,
        apiKey: process.env.OPENAI_API_KEY,
      };
  }
}
