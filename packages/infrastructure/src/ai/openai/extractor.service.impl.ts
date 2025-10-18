import {
  AiExtractorService,
  TextExtractionResult,
  TypeDetectionResult,
  DocumentType,
  ExtractionResult,
  Result,
} from '@extractiq/core';
import { getOpenAIClient } from './client';
import * as pdf from 'pdf-parse';
import * as fs from 'fs/promises';
import {
  TYPE_DETECTION_SYSTEM_PROMPT,
  TYPE_DETECTION_USER_PROMPT,
} from './prompts/type-detection.prompt';
import {
  INVOICE_EXTRACTION_SYSTEM_PROMPT,
  INVOICE_EXTRACTION_USER_PROMPT,
} from './prompts/invoice-extraction.prompt';
import {
  CONTRACT_EXTRACTION_SYSTEM_PROMPT,
  CONTRACT_EXTRACTION_USER_PROMPT,
} from './prompts/contract-extraction.prompt';
import {
  GENERIC_EXTRACTION_SYSTEM_PROMPT,
  GENERIC_EXTRACTION_USER_PROMPT,
} from './prompts/generic-extraction.prompt';

export class OpenAIExtractorService implements AiExtractorService {
  private readonly client = getOpenAIClient();
  private readonly model = 'gpt-4o-mini'; // Cost-effective model

  async extractText(filePath: string): Promise<Result<TextExtractionResult, Error>> {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdf(buffer);

      return Result.ok({
        text: data.text,
        pageCount: data.numpages,
        metadata: {
          info: data.info,
          version: data.version,
        },
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async detectType(text: string): Promise<Result<TypeDetectionResult, Error>> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: TYPE_DETECTION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: TYPE_DETECTION_USER_PROMPT(text),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for more consistent results
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
      const { systemPrompt, userPrompt } = this.getPromptForType(documentType, text);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Very low temperature for extraction accuracy
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      const extractedData = JSON.parse(content);

      return Result.ok({
        type: documentType,
        confidence: 0.9, // High confidence for successful extraction
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
      const { systemPrompt } = this.getPromptForType(extractedData.type, text);

      const response = await this.client.chat.completions.create({
        model: this.model,
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
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      const correctedData = JSON.parse(content);

      return Result.ok({
        type: extractedData.type,
        confidence: 0.85, // Slightly lower confidence for corrected data
        data: correctedData,
        extractedAt: new Date(),
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private getPromptForType(
    type: DocumentType,
    text: string
  ): { systemPrompt: string; userPrompt: string } {
    switch (type) {
      case DocumentType.INVOICE:
        return {
          systemPrompt: INVOICE_EXTRACTION_SYSTEM_PROMPT,
          userPrompt: INVOICE_EXTRACTION_USER_PROMPT(text),
        };
      case DocumentType.CONTRACT:
        return {
          systemPrompt: CONTRACT_EXTRACTION_SYSTEM_PROMPT,
          userPrompt: CONTRACT_EXTRACTION_USER_PROMPT(text),
        };
      case DocumentType.GENERIC:
      case DocumentType.RECEIPT:
      default:
        return {
          systemPrompt: GENERIC_EXTRACTION_SYSTEM_PROMPT,
          userPrompt: GENERIC_EXTRACTION_USER_PROMPT(text),
        };
    }
  }
}
