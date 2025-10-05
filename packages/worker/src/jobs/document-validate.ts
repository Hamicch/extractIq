import { Job } from 'bullmq';
import { db, eq } from '@docuflow/db';
import { documents, documentExtractions, processingAuditLog } from '@docuflow/db/schema';
import type {
  DocumentValidateJobData,
  DocumentValidateResult,
} from '@docuflow/shared';
import { wsClient } from '../websocket/client';

const CONFIDENCE_THRESHOLD = 0.75;

export async function processDocumentValidate(
  job: Job<DocumentValidateJobData>
): Promise<DocumentValidateResult> {
  const { documentId, tenantId, extractionId } = job.data;
  const startTime = Date.now();

  try {
    // Emit progress: 0%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'validate',
      progress: 0,
      message: 'Starting validation',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(0);

    // Fetch extraction data
    const [extraction] = await db
      .select()
      .from(documentExtractions)
      .where(eq(documentExtractions.id, extractionId))
      .limit(1);

    if (!extraction) {
      throw new Error('Extraction not found');
    }

    // Emit progress: 25%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'validate',
      progress: 25,
      message: 'Checking confidence scores',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(25);

    const confidenceScore = parseFloat(extraction.confidenceScore);
    const extractedData = extraction.data as Record<string, any>;

    // Check overall confidence
    const isConfident = confidenceScore >= CONFIDENCE_THRESHOLD;

    // Emit progress: 50%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'validate',
      progress: 50,
      message: 'Validating field completeness',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(50);

    // Identify low confidence fields
    const lowConfidenceFields: string[] = [];
    const validationErrors: string[] = [];

    // Validate based on extraction type
    if (extraction.extractionType === 'invoice') {
      validateInvoice(extractedData, lowConfidenceFields, validationErrors);
    } else if (extraction.extractionType === 'contract') {
      validateContract(extractedData, lowConfidenceFields, validationErrors);
    } else if (extraction.extractionType === 'receipt') {
      validateReceipt(extractedData, lowConfidenceFields, validationErrors);
    }

    // Emit progress: 75%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'validate',
      progress: 75,
      message: 'Finalizing validation',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(75);

    const isValid = isConfident && validationErrors.length === 0;

    // Update document status
    await db
      .update(documents)
      .set({
        status: isValid ? 'completed' : 'failed',
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    const durationMs = Date.now() - startTime;
    const costCents = Math.floor(Math.random() * 10) + 1; // $0.01 to $0.10

    // Log to audit
    await db.insert(processingAuditLog).values({
      documentId,
      stage: 'validate',
      status: 'completed',
      durationMs,
      costCents,
      metadata: {
        isValid,
        confidenceScore,
        lowConfidenceFields,
        validationErrors,
      },
      createdAt: new Date(),
    });

    // Emit progress: 100%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'validate',
      progress: 100,
      message: 'Validation completed',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(100);

    // Emit completion or failure
    if (isValid) {
      wsClient.emitCompleted({
        documentId,
        tenantId,
        extractionId,
        timestamp: new Date().toISOString(),
      });

      wsClient.emitStatus({
        documentId,
        tenantId,
        status: 'completed',
        stage: 'complete',
        timestamp: new Date().toISOString(),
      });
    } else {
      wsClient.emitFailed({
        documentId,
        tenantId,
        stage: 'validate',
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Document validation failed',
          details: {
            lowConfidenceFields,
            validationErrors,
            confidenceScore,
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      documentId,
      isValid,
      lowConfidenceFields,
      validationErrors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const durationMs = Date.now() - startTime;

    // Log failure to audit
    await db.insert(processingAuditLog).values({
      documentId,
      stage: 'validate',
      status: 'failed',
      durationMs,
      errorMessage,
      createdAt: new Date(),
    });

    // Update document status
    await db
      .update(documents)
      .set({
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Emit failed event
    wsClient.emitFailed({
      documentId,
      tenantId,
      stage: 'validate',
      error: {
        code: 'VALIDATION_ERROR',
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

function validateInvoice(
  data: Record<string, any>,
  lowConfidenceFields: string[],
  errors: string[]
): void {
  // Check required fields
  if (!data.invoiceNumber || data.invoiceNumber === '') {
    errors.push('Missing invoice number');
    lowConfidenceFields.push('invoiceNumber');
  }

  if (!data.total || typeof data.total !== 'number') {
    errors.push('Invalid or missing total amount');
    lowConfidenceFields.push('total');
  }

  if (!data.vendor || data.vendor === '') {
    errors.push('Missing vendor information');
    lowConfidenceFields.push('vendor');
  }

  // Validate totals
  if (data.lineItems && Array.isArray(data.lineItems) && data.total) {
    const calculatedSubtotal = data.lineItems.reduce(
      (sum: number, item: any) => sum + (item.amount || 0),
      0
    );
    const expectedTotal = calculatedSubtotal + (data.tax || 0);

    if (Math.abs(expectedTotal - data.total) > 0.01) {
      errors.push('Total amount does not match line items');
      lowConfidenceFields.push('total', 'lineItems');
    }
  }
}

function validateContract(
  data: Record<string, any>,
  lowConfidenceFields: string[],
  errors: string[]
): void {
  if (!data.contractNumber) {
    errors.push('Missing contract number');
    lowConfidenceFields.push('contractNumber');
  }

  if (!data.parties || !Array.isArray(data.parties) || data.parties.length < 2) {
    errors.push('Contract must have at least 2 parties');
    lowConfidenceFields.push('parties');
  }

  if (!data.effectiveDate) {
    errors.push('Missing effective date');
    lowConfidenceFields.push('effectiveDate');
  }
}

function validateReceipt(
  data: Record<string, any>,
  lowConfidenceFields: string[],
  errors: string[]
): void {
  if (!data.merchant) {
    errors.push('Missing merchant name');
    lowConfidenceFields.push('merchant');
  }

  if (!data.total || typeof data.total !== 'number') {
    errors.push('Invalid or missing total amount');
    lowConfidenceFields.push('total');
  }

  if (!data.date) {
    errors.push('Missing receipt date');
    lowConfidenceFields.push('date');
  }
}
