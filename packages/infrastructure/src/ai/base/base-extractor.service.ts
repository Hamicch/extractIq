import {
  AiExtractorService,
  TextExtractionResult,
  TypeDetectionResult,
  DocumentType,
  ExtractionResult,
  Result,
} from '@extractiq/core';
import { AiModelConfig } from '../types';
import * as pdf from 'pdf-parse';
import * as fs from 'fs/promises';

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
    // Import prompts dynamically to avoid circular dependencies
    const {
      TYPE_DETECTION_SYSTEM_PROMPT,
      TYPE_DETECTION_USER_PROMPT,
    } = require('../prompts/type-detection.prompt');

    const {
      INVOICE_EXTRACTION_SYSTEM_PROMPT,
      INVOICE_EXTRACTION_USER_PROMPT,
    } = require('../prompts/invoice-extraction.prompt');

    const {
      CONTRACT_EXTRACTION_SYSTEM_PROMPT,
      CONTRACT_EXTRACTION_USER_PROMPT,
    } = require('../prompts/contract-extraction.prompt');

    const {
      GENERIC_EXTRACTION_SYSTEM_PROMPT,
      GENERIC_EXTRACTION_USER_PROMPT,
    } = require('../prompts/generic-extraction.prompt');

    switch (type) {
      case DocumentType.INVOICE:
        return {
          systemPrompt: INVOICE_EXTRACTION_SYSTEM_PROMPT,
          extractionUserPrompt: INVOICE_EXTRACTION_USER_PROMPT,
        };
      case DocumentType.CONTRACT:
        return {
          systemPrompt: CONTRACT_EXTRACTION_SYSTEM_PROMPT,
          extractionUserPrompt: CONTRACT_EXTRACTION_USER_PROMPT,
        };
      case DocumentType.GENERIC:
      case DocumentType.RECEIPT:
      default:
        return {
          systemPrompt: GENERIC_EXTRACTION_SYSTEM_PROMPT,
          extractionUserPrompt: GENERIC_EXTRACTION_USER_PROMPT,
        };
    }
  }

  protected getTypeDetectionPrompts(): {
    systemPrompt: string;
    userPrompt: (text: string) => string;
  } {
    const {
      TYPE_DETECTION_SYSTEM_PROMPT,
      TYPE_DETECTION_USER_PROMPT,
    } = require('../prompts/type-detection.prompt');

    return {
      systemPrompt: TYPE_DETECTION_SYSTEM_PROMPT,
      userPrompt: TYPE_DETECTION_USER_PROMPT,
    };
  }
}
