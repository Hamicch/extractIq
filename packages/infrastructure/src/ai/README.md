# AI Provider Abstraction

This module provides a flexible, provider-agnostic AI extraction system that makes it easy to switch between different AI providers (OpenAI, Anthropic, local models, etc.) without changing application code.

## Features

- **Provider-Agnostic**: Switch AI providers via environment variables
- **Type-Safe**: Full TypeScript support with interfaces
- **Cost-Optimized**: Defaults to GPT-4o-mini (95% cheaper than GPT-4)
- **Extensible**: Easy to add new providers
- **Configuration-Driven**: Control all parameters via env vars or code

## Supported Providers

- ✅ **OpenAI** (GPT-4o, GPT-4o-mini)
- ✅ **Anthropic** (Claude 3.5 Sonnet, Claude 3.5 Haiku)
- ⏳ **Ollama** (Local models like Llama 3) - Coming soon
- ⏳ **Groq** (Fast inference) - Coming soon

## Quick Start

### Using Environment Variables (Recommended)

```bash
# .env file

# Default: OpenAI GPT-4o-mini
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...

# OR: Use Anthropic Claude
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-haiku-20241022
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Fine-tune parameters
AI_TEMPERATURE=0.1
AI_MAX_TOKENS=4096
AI_TIMEOUT=60000
```

The DI container will automatically use the correct provider:

```typescript
import { getAiExtractor } from '@/lib/di/container';

const aiExtractor = getAiExtractor(); // Automatically uses env config
const result = await aiExtractor.extractData(text, documentType);
```

### Programmatic Configuration

```typescript
import { AiExtractorFactory, AiProvider } from '@extractiq/infrastructure';

// Use factory with environment config
const extractor = AiExtractorFactory.create();

// OR: Use specific provider
const openaiExtractor = AiExtractorFactory.createCustom(
  AiProvider.OPENAI,
  'gpt-4o-mini',
  process.env.OPENAI_API_KEY
);

// OR: Use custom configuration
const config = {
  provider: AiProvider.ANTHROPIC,
  model: 'claude-3-5-sonnet-20241022',
  apiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1,
  maxTokens: 8000,
};
const customExtractor = AiExtractorFactory.createFromConfig(config);
```

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│         Application Layer           │
│     (Uses AiExtractorService)       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Core Layer (Port)          │
│     interface AiExtractorService    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Infrastructure Layer           │
│  ┌────────────────────────────────┐ │
│  │  AiExtractorFactory            │ │
│  └─────┬──────────────────────────┘ │
│        │                             │
│  ┌─────▼──────┐  ┌──────────────┐   │
│  │  OpenAI    │  │  Anthropic   │   │
│  │ Extractor  │  │  Extractor   │   │
│  └────────────┘  └──────────────┘   │
└─────────────────────────────────────┘
```

### Key Components

1. **Port (Interface)**: `AiExtractorService` in `@extractiq/core`
   - Defines what AI extractors must do
   - No implementation details
   - Used by use cases

2. **Base Class**: `BaseAiExtractorService`
   - Common functionality (PDF parsing, prompt selection)
   - Abstract methods for provider-specific calls
   - Reduces code duplication

3. **Providers**: Provider-specific implementations
   - `OpenAIExtractorService`: Uses OpenAI API
   - `AnthropicExtractorService`: Uses Anthropic API
   - Each extends `BaseAiExtractorService`

4. **Factory**: `AiExtractorFactory`
   - Creates correct provider based on config
   - Single source of truth for instantiation

## Cost Comparison

| Provider | Model | Cost per 1M tokens (input) | Cost per 1M tokens (output) |
|----------|-------|---------------------------|---------------------------|
| OpenAI | GPT-4o-mini | $0.15 | $0.60 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| Anthropic | Claude 3.5 Haiku | $0.80 | $4.00 |
| Anthropic | Claude 3.5 Sonnet | $3.00 | $15.00 |
| Ollama | Llama 3 (local) | FREE | FREE |

**Recommendation**: Start with GPT-4o-mini for lowest cost, switch to Claude 3.5 Haiku if you need better quality.

## Adding a New Provider

Adding a new AI provider is straightforward:

### 1. Create Provider Implementation

```typescript
// packages/infrastructure/src/ai/providers/groq-extractor.service.ts
import { BaseAiExtractorService } from '../base/base-extractor.service';
import { AiModelConfig } from '../types';

export class GroqExtractorService extends BaseAiExtractorService {
  private readonly client: GroqClient;

  constructor(config: AiModelConfig) {
    super(config);
    this.client = new GroqClient({ apiKey: config.apiKey });
  }

  async detectType(text: string): Promise<Result<TypeDetectionResult, Error>> {
    // Implement using Groq API
  }

  async extractData(text: string, type: DocumentType): Promise<Result<ExtractionResult, Error>> {
    // Implement using Groq API
  }

  async validateAndCorrect(...): Promise<Result<ExtractionResult, Error>> {
    // Implement using Groq API
  }
}
```

### 2. Add to Factory

```typescript
// packages/infrastructure/src/ai/factory.ts
case AiProvider.GROQ:
  return new GroqExtractorService(config);
```

### 3. Add Configuration

```typescript
// packages/infrastructure/src/ai/types.ts
GROQ_LLAMA3_70B: {
  provider: AiProvider.GROQ,
  model: 'llama-3.1-70b-versatile',
  temperature: 0.1,
  maxTokens: 4096,
} as AiModelConfig,
```

### 4. Use It

```bash
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile
GROQ_API_KEY=gsk_...
```

Done! No changes to application code needed.

## Testing Different Providers

```typescript
import { AiExtractorFactory, AiProvider } from '@extractiq/infrastructure';

// Test with OpenAI
const openai = AiExtractorFactory.createCustom(AiProvider.OPENAI, 'gpt-4o-mini', openaiKey);
const result1 = await openai.extractData(text, DocumentType.INVOICE);

// Test with Anthropic
const anthropic = AiExtractorFactory.createCustom(AiProvider.ANTHROPIC, 'claude-3-5-haiku-20241022', anthropicKey);
const result2 = await anthropic.extractData(text, DocumentType.INVOICE);

// Compare quality, cost, speed
console.log('OpenAI:', result1);
console.log('Anthropic:', result2);
```

## Environment Variable Reference

```bash
# Provider Configuration
AI_PROVIDER=openai              # openai | anthropic | ollama | groq
AI_MODEL=gpt-4o-mini           # Provider-specific model name
AI_BASE_URL=                   # Optional: Override API endpoint
AI_API_KEY=                    # Optional: Override provider API key

# Tuning Parameters
AI_TEMPERATURE=0.1             # 0.0 to 1.0 (lower = more deterministic)
AI_MAX_TOKENS=4096            # Maximum tokens in response
AI_TIMEOUT=60000              # API timeout in milliseconds

# Provider-Specific Keys (used as fallback if AI_API_KEY not set)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
```

## Best Practices

1. **Start Cheap**: Use GPT-4o-mini in development/testing
2. **Monitor Quality**: Track extraction accuracy metrics
3. **A/B Test**: Compare providers on sample documents
4. **Cost Track**: Log token usage per provider
5. **Fallback**: Implement retry with different provider on failure
6. **Local Dev**: Use Ollama for free local testing

## Future Enhancements

- [ ] Implement Ollama provider for local models
- [ ] Implement Groq provider for fast inference
- [ ] Add automatic fallback on provider failure
- [ ] Add cost tracking middleware
- [ ] Add caching layer to reduce API calls
- [ ] Add streaming support for large documents
- [ ] Add batch processing for multiple documents
