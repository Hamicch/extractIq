import {
  AiExtractorService,
  TextExtractionResult,
  TypeDetectionResult,
  DocumentType,
  ExtractionResult,
  Result,
} from '@extractiq/core';
import { AiModelConfig } from '../types';
import * as fs from 'fs/promises';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');
import * as invoicePrompts from '../prompts/invoice-extraction.prompt';
import * as contractPrompts from '../prompts/contract-extraction.prompt';
import * as genericPrompts from '../prompts/generic-extraction.prompt';
import * as typeDetectionPrompts from '../prompts/type-detection.prompt';

/**
 * Base AI Extractor Service
 * Provides common functionality for all AI providers
 * Subclasses implement provider-specific AI calls
 */
export abstract class BaseAiExtractorService implements AiExtractorService {
  constructor(protected readonly config: AiModelConfig) {}

  /**
   * Extract text from PDF (provider-agnostic)
   */
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

  /**
   * Detect document type using AI
   * Implemented by subclasses for each provider
   */
  abstract detectType(text: string): Promise<Result<TypeDetectionResult, Error>>;

  /**
   * Extract structured data from document
   * Implemented by subclasses for each provider
   */
  abstract extractData(
    text: string,
    documentType: DocumentType
  ): Promise<Result<ExtractionResult, Error>>;

  /**
   * Validate and correct extracted data
   * Implemented by subclasses for each provider
   */
  abstract validateAndCorrect(
    text: string,
    extractedData: ExtractionResult,
    validationErrors: string[]
  ): Promise<Result<ExtractionResult, Error>>;

  /**
   * Helper to get prompts for document type
   */
  protected getPromptsForType(type: DocumentType): {
    systemPrompt: string;
    extractionUserPrompt: (text: string) => string;
  } {
    switch (type) {
      case DocumentType.INVOICE:
        return {
          systemPrompt: invoicePrompts.INVOICE_EXTRACTION_SYSTEM_PROMPT,
          extractionUserPrompt: invoicePrompts.INVOICE_EXTRACTION_USER_PROMPT,
        };
      case DocumentType.CONTRACT:
        return {
          systemPrompt: contractPrompts.CONTRACT_EXTRACTION_SYSTEM_PROMPT,
          extractionUserPrompt: contractPrompts.CONTRACT_EXTRACTION_USER_PROMPT,
        };
      case DocumentType.GENERIC:
      case DocumentType.RECEIPT:
      default:
        return {
          systemPrompt: genericPrompts.GENERIC_EXTRACTION_SYSTEM_PROMPT,
          extractionUserPrompt: genericPrompts.GENERIC_EXTRACTION_USER_PROMPT,
        };
    }
  }

  protected getTypeDetectionPrompts(): {
    systemPrompt: string;
    userPrompt: (text: string) => string;
  } {
    return {
      systemPrompt: typeDetectionPrompts.TYPE_DETECTION_SYSTEM_PROMPT,
      userPrompt: typeDetectionPrompts.TYPE_DETECTION_USER_PROMPT,
    };
  }
}
