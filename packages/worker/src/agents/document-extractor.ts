import OpenAI from 'openai';
import { db } from '@docuflow/db';
import { processingAuditLog } from '@docuflow/db/schema';
import {
  DocumentExtraction,
  DocumentTypeDetection,
  DocumentTypeDetectionSchema,
  getSchemaForType,
  getFieldsWithLowConfidence,
} from '../schemas/extraction-schemas';
import { OCRProcessor } from './ocr-processor';

export interface ExtractionOptions {
  maxRetries?: number;
  confidenceThreshold?: number;
  temperature?: number;
}

export interface ExtractionResult {
  extraction: DocumentExtraction;
  metadata: {
    documentType: string;
    attemptCount: number;
    totalTokens: number;
    estimatedCost: number;
    durationMs: number;
    lowConfidenceFields: Array<{ path: string; confidence: number }>;
    requiresHumanReview: boolean;
  };
}

/**
 * AI-powered document extraction agent with self-correction loop
 */
export class DocumentExtractor {
  private openai: OpenAI;
  private ocrProcessor: OCRProcessor;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.ocrProcessor = new OCRProcessor();
  }

  /**
   * Main extraction pipeline
   */
  async extractFromDocument(
    documentBuffer: Buffer,
    documentId: string,
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const {
      maxRetries = 2,
      confidenceThreshold = 0.7,
      temperature = 0,
    } = options;

    let totalTokens = 0;
    let attemptCount = 0;

    try {
      // Step 1: OCR Stage
      console.log(`[DocumentExtractor] Starting OCR for document ${documentId}`);
      const ocrResult = await this.ocrProcessor.extractFromPDF(documentBuffer, documentId);

      if (this.ocrProcessor.requiresExternalOCR(ocrResult)) {
        throw new Error('Document requires external OCR processing (poor quality or no text)');
      }

      const preprocessedText = this.ocrProcessor.preprocessText(ocrResult.text);

      // Step 2: Detect document type
      console.log(`[DocumentExtractor] Detecting document type for ${documentId}`);
      const typeDetection = await this.detectDocumentType(preprocessedText);
      totalTokens += typeDetection.tokensUsed;

      if (typeDetection.result.confidence < 0.8) {
        console.warn(`[DocumentExtractor] Low confidence in type detection: ${typeDetection.result.confidence}`);
      }

      // Step 3: Schema-guided extraction with retry loop
      let extraction: DocumentExtraction | null = null;
      let validationErrors: string[] = [];

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        attemptCount = attempt + 1;
        console.log(`[DocumentExtractor] Extraction attempt ${attemptCount} for ${documentId}`);

        const extractionAttempt = await this.performExtraction(
          preprocessedText,
          typeDetection.result.detected_type,
          temperature,
          attempt > 0 ? validationErrors : undefined
        );

        totalTokens += extractionAttempt.tokensUsed;

        // Step 4: Validate extraction
        const validation = this.validateExtraction(
          extractionAttempt.result,
          confidenceThreshold
        );

        if (validation.isValid) {
          extraction = extractionAttempt.result;
          break;
        }

        validationErrors = validation.errors;
        console.warn(`[DocumentExtractor] Validation failed on attempt ${attemptCount}:`, validationErrors);

        // If this is the last attempt, use the extraction anyway but flag it
        if (attempt === maxRetries) {
          extraction = extractionAttempt.result;
          console.warn(`[DocumentExtractor] Max retries reached, using last extraction with validation errors`);
        }
      }

      if (!extraction) {
        throw new Error('Extraction failed after all attempts');
      }

      // Calculate costs (GPT-4 pricing: ~$0.03/1K input tokens, $0.06/1K output tokens)
      const estimatedCost = (totalTokens / 1000) * 0.045; // Average of input/output

      const lowConfidenceFields = getFieldsWithLowConfidence(extraction, confidenceThreshold);
      const requiresHumanReview = lowConfidenceFields.length > 0 || validationErrors.length > 0;

      const result: ExtractionResult = {
        extraction,
        metadata: {
          documentType: typeDetection.result.detected_type,
          attemptCount,
          totalTokens,
          estimatedCost,
          durationMs: Date.now() - startTime,
          lowConfidenceFields,
          requiresHumanReview,
        },
      };

      // Log successful extraction
      await this.logExtraction(documentId, 'completed', result.metadata);

      return result;
    } catch (error) {
      // Log failed extraction
      await this.logExtraction(documentId, 'failed', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startTime,
        attemptCount,
        totalTokens,
      });

      throw error;
    }
  }

  /**
   * Detect document type using GPT-4
   */
  private async detectDocumentType(text: string): Promise<{
    result: DocumentTypeDetection;
    tokensUsed: number;
  }> {
    const systemPrompt = `You are a document classifier. Analyze the given text and determine if it is:
- legal_contract: Legal agreements, contracts, terms of service
- invoice: Invoices, bills, payment requests
- generic: Any other type of document

Provide your classification with a confidence score (0-1) and brief reasoning.`;

    const userPrompt = `Classify this document (first 2000 characters):

${text.substring(0, 2000)}

Respond in JSON format matching this schema:
{
  "detected_type": "legal_contract" | "invoice" | "generic",
  "confidence": 0.95,
  "reasoning": "This appears to be an invoice because..."
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const validated = DocumentTypeDetectionSchema.parse(result);

    return {
      result: validated,
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  }

  /**
   * Perform extraction using GPT-4 with schema guidance
   */
  private async performExtraction(
    text: string,
    documentType: 'legal_contract' | 'invoice' | 'generic',
    temperature: number,
    previousErrors?: string[]
  ): Promise<{
    result: DocumentExtraction;
    tokensUsed: number;
  }> {
    const schema = getSchemaForType(documentType);
    const systemPrompt = this.buildExtractionSystemPrompt(documentType);
    const userPrompt = this.buildExtractionUserPrompt(text, documentType, previousErrors);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const validated = schema.parse(result);

    return {
      result: validated as DocumentExtraction,
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  }

  /**
   * Build system prompt with schema guidance and examples
   */
  private buildExtractionSystemPrompt(documentType: string): string {
    const basePrompt = `You are an expert document extraction AI. Extract structured data from documents with high accuracy.

For each field you extract, provide a confidence score (0-1) indicating how certain you are about the value.

Guidelines:
- Use confidence 0.9-1.0 for explicitly stated information
- Use confidence 0.7-0.9 for information that requires minor interpretation
- Use confidence 0.5-0.7 for information that requires significant interpretation
- Use confidence 0-0.5 for guessed or highly uncertain information
- If a field is not found, omit it or use null (depending on schema)
- Extract dates in ISO 8601 format (YYYY-MM-DD)
- Extract monetary amounts as numbers (not strings with currency symbols)`;

    const examples: Record<string, string> = {
      invoice: `

Example extraction for an invoice:
{
  "type": "invoice",
  "invoice_number": { "value": "INV-2024-001", "confidence": 0.95 },
  "date": { "value": "2024-01-15", "confidence": 0.9 },
  "vendor": {
    "name": { "value": "Acme Corp", "confidence": 0.95 }
  },
  "line_items": [
    {
      "description": { "value": "Professional Services", "confidence": 0.9 },
      "quantity": { "value": 10, "confidence": 0.95 },
      "unit_price": { "value": 150.00, "confidence": 0.95 },
      "amount": { "value": 1500.00, "confidence": 0.95 }
    }
  ],
  "subtotal": { "value": 1500.00, "confidence": 0.95 },
  "tax": { "value": 120.00, "confidence": 0.9 },
  "total": { "value": 1620.00, "confidence": 0.95 },
  "currency": { "value": "USD", "confidence": 0.9 }
}`,
      legal_contract: `

Example extraction for a legal contract:
{
  "type": "legal_contract",
  "parties": [
    {
      "name": { "value": "John Doe", "confidence": 0.95 },
      "role": { "value": "party_a", "confidence": 0.9 }
    },
    {
      "name": { "value": "Jane Smith", "confidence": 0.95 },
      "role": { "value": "party_b", "confidence": 0.9 }
    }
  ],
  "effective_date": { "value": "2024-01-01", "confidence": 0.95 },
  "governing_law": { "value": "State of California", "confidence": 0.9 },
  "payment_terms": {
    "amount": { "value": 10000, "confidence": 0.95 },
    "currency": { "value": "USD", "confidence": 0.95 }
  }
}`,
      generic: `

Example extraction for a generic document:
{
  "type": "generic",
  "title": { "value": "Q4 2023 Report", "confidence": 0.95 },
  "date": { "value": "2023-12-31", "confidence": 0.9 },
  "key_points": [
    {
      "point": { "value": "Revenue increased by 25%", "confidence": 0.95 }
    },
    {
      "point": { "value": "Expanded to 3 new markets", "confidence": 0.9 }
    }
  ],
  "summary": { "value": "Strong performance in Q4 with significant growth", "confidence": 0.85 }
}`,
    };

    return basePrompt + (examples[documentType] || examples.generic);
  }

  /**
   * Build user prompt with correction guidance if needed
   */
  private buildExtractionUserPrompt(
    text: string,
    documentType: string,
    previousErrors?: string[]
  ): string {
    let prompt = `Extract structured data from this ${documentType.replace('_', ' ')} document:\n\n${text}`;

    if (previousErrors && previousErrors.length > 0) {
      prompt += `\n\nPREVIOUS ATTEMPT HAD ISSUES:\n${previousErrors.join('\n')}`;
      prompt += '\n\nPlease correct these issues in your extraction.';
    }

    prompt += '\n\nRespond with JSON matching the expected schema.';

    return prompt;
  }

  /**
   * Validate extraction results
   */
  private validateExtraction(
    extraction: DocumentExtraction,
    confidenceThreshold: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for low confidence fields
    const lowConfidenceFields = getFieldsWithLowConfidence(extraction, confidenceThreshold);
    if (lowConfidenceFields.length > 0) {
      errors.push(
        `Low confidence fields (< ${confidenceThreshold}): ${lowConfidenceFields
          .map(f => `${f.path} (${f.confidence.toFixed(2)})`)
          .join(', ')}`
      );
    }

    // Type-specific validation
    if (extraction.type === 'invoice') {
      const invoice = extraction;

      // Validate invoice calculations
      const lineItemsTotal = invoice.line_items.reduce((sum, item) => {
        const expectedAmount = item.quantity.value * item.unit_price.value;
        const actualAmount = item.amount.value;

        if (Math.abs(expectedAmount - actualAmount) > 0.01) {
          errors.push(
            `Line item calculation mismatch: ${item.description.value} - ` +
            `expected ${expectedAmount}, got ${actualAmount}`
          );
        }

        return sum + actualAmount;
      }, 0);

      // Check subtotal
      if (Math.abs(lineItemsTotal - invoice.subtotal.value) > 0.01) {
        errors.push(
          `Subtotal mismatch: line items sum to ${lineItemsTotal}, ` +
          `but subtotal is ${invoice.subtotal.value}`
        );
      }

      // Check total calculation
      const calculatedTotal = invoice.subtotal.value + (invoice.tax?.value || 0);
      if (Math.abs(calculatedTotal - invoice.total.value) > 0.01) {
        errors.push(
          `Total calculation error: subtotal + tax = ${calculatedTotal}, ` +
          `but total is ${invoice.total.value}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Log extraction to audit trail
   */
  private async logExtraction(
    documentId: string,
    status: 'completed' | 'failed',
    metadata: any
  ): Promise<void> {
    try {
      await db.insert(processingAuditLog).values({
        documentId,
        stage: 'extract',
        status,
        durationMs: metadata.durationMs,
        errorMessage: metadata.error,
        metadata,
      });
    } catch (error) {
      console.error('Failed to log extraction:', error);
    }
  }
}
