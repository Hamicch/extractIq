import { DocumentType, ExtractionResult, Result, TypeDetectionResult } from '@extractiq/core';
import { BaseAiExtractorService } from '../base/base-extractor.service';
import { AiModelConfig } from '../types';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claude-specific AI Extractor implementation
 * Example of how easy it is to add new providers
 */
export class AnthropicExtractorService extends BaseAiExtractorService {
  private readonly client: Anthropic;

  constructor(config: AiModelConfig) {
    super(config);

    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      timeout: config.timeout || 60000,
    });
  }

  async detectType(text: string): Promise<Result<TypeDetectionResult, Error>> {
    try {
      const { systemPrompt, userPrompt } = this.getTypeDetectionPrompts();

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt(text),
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return Result.fail(new Error('Unexpected response type from Anthropic'));
      }

      const result = JSON.parse(content.text);

      return Result.ok({
        type: result.type as DocumentType,
        confidence: result.confidence,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async extractData(
    text: string,
    documentType: DocumentType
  ): Promise<Result<ExtractionResult, Error>> {
    try {
      const { systemPrompt, extractionUserPrompt } = this.getPromptsForType(documentType);

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: extractionUserPrompt(text),
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return Result.fail(new Error('Unexpected response type from Anthropic'));
      }

      const extractedData = JSON.parse(content.text);

      return Result.ok({
        type: documentType,
        confidence: 0.9,
        data: extractedData,
        extractedAt: new Date(),
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async validateAndCorrect(
    text: string,
    extractedData: ExtractionResult,
    validationErrors: string[]
  ): Promise<Result<ExtractionResult, Error>> {
    try {
      const { systemPrompt } = this.getPromptsForType(extractedData.type);

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `The following data was extracted but has validation errors:

Extracted Data:
${JSON.stringify(extractedData.data, null, 2)}

Validation Errors:
${validationErrors.join('\n')}

Original Document:
${text}

Please correct the data based on the validation errors and return the corrected JSON.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return Result.fail(new Error('Unexpected response type from Anthropic'));
      }

      const correctedData = JSON.parse(content.text);

      return Result.ok({
        type: extractedData.type,
        confidence: 0.85,
        data: correctedData,
        extractedAt: new Date(),
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
