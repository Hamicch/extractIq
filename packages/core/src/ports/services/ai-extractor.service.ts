import { DocumentType, ExtractionResult } from '../../domain/document/document.types';
import { Result } from '../../types/result';

export interface TextExtractionResult {
  text: string;
  pageCount: number;
  metadata?: Record<string, any>;
}

export interface TypeDetectionResult {
  type: DocumentType;
  confidence: number;
}

/**
 * AI Extractor Service interface (port)
 * Infrastructure layer will implement this with OpenAI
 */
export interface AiExtractorService {
  /**
   * Extract text from PDF file
   */
  extractText(filePath: string): Promise<Result<TextExtractionResult, Error>>;

  /**
   * Detect document type using AI
   */
  detectType(text: string): Promise<Result<TypeDetectionResult, Error>>;

  /**
   * Extract structured data from document
   */
  extractData(
    text: string,
    documentType: DocumentType
  ): Promise<Result<ExtractionResult, Error>>;

  /**
   * Validate extracted data with self-correction
   */
  validateAndCorrect(
    text: string,
    extractedData: ExtractionResult,
    validationErrors: string[]
  ): Promise<Result<ExtractionResult, Error>>;
}
