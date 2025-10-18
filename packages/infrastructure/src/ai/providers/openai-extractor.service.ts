import { DocumentType, ExtractionResult, Result, TypeDetectionResult } from '@extractiq/core';
import { BaseAiExtractorService } from '../base/base-extractor.service';
import { AiModelConfig } from '../types';
import OpenAI from 'openai';

/**
 * OpenAI-specific AI Extractor implementation
 */
export class OpenAIExtractorService extends BaseAiExtractorService {
  private readonly client: OpenAI;

  constructor(config: AiModelConfig) {
    super(config);

    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
      timeout: config.timeout || 60000,
    });
  }

  async detectType(text: string): Promise<Result<TypeDetectionResult, Error>> {
    try {
      const { systemPrompt, userPrompt } = this.getTypeDetectionPrompts();

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt(text),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: this.config.temperature || 0.3,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      const result = JSON.parse(content);

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

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: extractionUserPrompt(text),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: this.config.temperature || 0.1,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      const extractedData = JSON.parse(content);

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

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
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
        response_format: { type: 'json_object' },
        temperature: this.config.temperature || 0.1,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      const correctedData = JSON.parse(content);

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
