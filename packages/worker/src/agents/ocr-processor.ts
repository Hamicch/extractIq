import pdf_parse from 'pdf-parse';
import { db } from '@docuflow/db';
import { processingAuditLog } from '@docuflow/db/schema';

// Handle ESM/CJS compatibility
const pdf = pdf_parse as any;

export interface OCRResult {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  quality: {
    hasText: boolean;
    estimatedQuality: 'high' | 'medium' | 'low';
    confidence: number;
  };
}

export interface OCRProcessorOptions {
  maxPages?: number;
  preserveLayout?: boolean;
}

/**
 * OCR Processor for extracting text from PDF documents
 */
export class OCRProcessor {
  /**
   * Extract text from PDF buffer
   */
  async extractFromPDF(
    buffer: Buffer,
    documentId: string,
    options: OCRProcessorOptions = {}
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Parse PDF
      const data = await pdf(buffer, {
        max: options.maxPages,
      });

      // Assess text quality
      const quality = this.assessTextQuality(data.text, data.numpages);

      // Log to audit trail
      await this.logOCRResult(documentId, {
        success: true,
        pageCount: data.numpages,
        textLength: data.text.length,
        quality: quality.estimatedQuality,
        confidence: quality.confidence,
        durationMs: Date.now() - startTime,
      });

      const result: OCRResult = {
        text: data.text,
        pageCount: data.numpages,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          creationDate: data.info?.CreationDate,
          modificationDate: data.info?.ModDate,
        },
        quality,
      };

      return result;
    } catch (error) {
      // Log error to audit trail
      await this.logOCRResult(documentId, {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startTime,
      });

      throw new Error(
        `OCR extraction failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Assess the quality of extracted text
   */
  private assessTextQuality(
    text: string,
    pageCount: number
  ): OCRResult['quality'] {
    const hasText = text.length > 0;

    if (!hasText) {
      return {
        hasText: false,
        estimatedQuality: 'low',
        confidence: 0,
      };
    }

    // Calculate text per page ratio
    const textPerPage = text.length / pageCount;

    // Check for common indicators of good text extraction
    const hasProperCapitalization = /[A-Z]/.test(text);
    const hasProperPunctuation = /[.,!?;:]/.test(text);
    const hasSentenceStructure = /[A-Z][^.!?]*[.!?]/.test(text); // Capital letter followed by sentence ending

    // Calculate quality indicators
    const qualityIndicators = [
      hasProperCapitalization,
      hasProperPunctuation,
      hasSentenceStructure,
      textPerPage > 200, // At least 200 chars per page
    ];

    const qualityScore =
      qualityIndicators.filter(Boolean).length / qualityIndicators.length;

    let estimatedQuality: 'high' | 'medium' | 'low';
    let confidence: number;

    if (qualityScore >= 0.75 && textPerPage > 500) {
      estimatedQuality = 'high';
      confidence = 0.9;
    } else if (qualityScore >= 0.5 && textPerPage > 200) {
      estimatedQuality = 'medium';
      confidence = 0.7;
    } else {
      estimatedQuality = 'low';
      confidence = 0.4;
    }

    return {
      hasText: true,
      estimatedQuality,
      confidence,
    };
  }

  /**
   * Handle multi-column layouts by detecting and splitting columns
   */
  preprocessText(text: string): string {
    // Remove excessive whitespace
    let processed = text.replace(/\s{3,}/g, ' ');

    // Normalize line breaks
    processed = processed.replace(/\r\n/g, '\n');
    processed = processed.replace(/\r/g, '\n');

    // Remove page numbers (common pattern: isolated numbers at start/end of pages)
    processed = processed.replace(/^\s*\d+\s*$/gm, '');

    // Remove headers/footers (repeated patterns)
    const lines = processed.split('\n');
    const lineCounts = new Map<string, number>();

    // Count occurrences of each line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5 && trimmed.length < 100) {
        lineCounts.set(trimmed, (lineCounts.get(trimmed) || 0) + 1);
      }
    }

    // Remove lines that appear more than 3 times (likely headers/footers)
    const repeatedLines = new Set(
      Array.from(lineCounts.entries())
        .filter(([_, count]) => count > 3)
        .map(([line]) => line)
    );

    processed = lines
      .filter((line) => !repeatedLines.has(line.trim()))
      .join('\n');

    return processed;
  }

  /**
   * Log OCR result to audit trail
   */
  private async logOCRResult(
    documentId: string,
    result: {
      success: boolean;
      pageCount?: number;
      textLength?: number;
      quality?: string;
      confidence?: number;
      error?: string;
      durationMs: number;
    }
  ): Promise<void> {
    try {
      await db.insert(processingAuditLog).values({
        documentId,
        stage: 'ocr',
        status: result.success ? 'completed' : 'failed',
        durationMs: result.durationMs,
        errorMessage: result.error,
        metadata: {
          pageCount: result.pageCount,
          textLength: result.textLength,
          quality: result.quality,
          confidence: result.confidence,
        },
      });
    } catch (error) {
      console.error('Failed to log OCR result:', error);
      // Don't throw - logging failure shouldn't break OCR
    }
  }

  /**
   * Detect if document requires external OCR (e.g., scanned image)
   */
  requiresExternalOCR(result: OCRResult): boolean {
    return (
      !result.quality.hasText ||
      result.quality.estimatedQuality === 'low' ||
      result.quality.confidence < 0.5
    );
  }
}
