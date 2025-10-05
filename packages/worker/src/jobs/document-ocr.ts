import { Job } from 'bullmq';
import { db, eq } from '@docuflow/db';
import { documents, processingAuditLog } from '@docuflow/db/schema';
import type {
  DocumentOcrJobData,
  DocumentOcrResult,
} from '@docuflow/shared';
import { wsClient } from '../websocket/client';

export async function processDocumentOcr(
  job: Job<DocumentOcrJobData>
): Promise<DocumentOcrResult> {
  const { documentId, tenantId, mimeType } = job.data;
  const startTime = Date.now();

  try {
    // Emit progress: 0%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'ocr',
      progress: 0,
      message: 'Initializing OCR process',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(0);

    // Update document status
    await db
      .update(documents)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    wsClient.emitStatus({
      documentId,
      tenantId,
      status: 'processing',
      stage: 'ocr',
      timestamp: new Date().toISOString(),
    });

    // Emit progress: 25%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'ocr',
      progress: 25,
      message: 'Loading document',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(25);

    // Simulate OCR processing (in real scenario, use Tesseract.js or external API)
    // For PDF: extract text directly or use OCR on images
    // For images: use OCR

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

    // Emit progress: 50%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'ocr',
      progress: 50,
      message: 'Extracting text',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(50);

    // Simulate extracted text based on mime type
    const extractedText = generateMockExtractedText(mimeType);
    const pageCount = mimeType === 'application/pdf' ? Math.floor(Math.random() * 20) + 1 : 1;
    const confidence = 0.85 + Math.random() * 0.14; // 0.85 to 0.99

    // Emit progress: 75%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'ocr',
      progress: 75,
      message: 'Processing text',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(75);

    // Update document with page count
    await db
      .update(documents)
      .set({
        pageCount,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    const durationMs = Date.now() - startTime;
    const costCents = Math.floor(Math.random() * 30) + 5; // $0.05 to $0.35

    // Log to audit
    await db.insert(processingAuditLog).values({
      documentId,
      stage: 'ocr',
      status: 'completed',
      durationMs,
      costCents,
      metadata: { confidence, pageCount },
      createdAt: new Date(),
    });

    // Emit progress: 100%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'ocr',
      progress: 100,
      message: 'OCR completed',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(100);

    return {
      documentId,
      extractedText,
      pageCount,
      confidence,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const durationMs = Date.now() - startTime;

    // Log failure to audit
    await db.insert(processingAuditLog).values({
      documentId,
      stage: 'ocr',
      status: 'failed',
      durationMs,
      errorMessage,
      createdAt: new Date(),
    });

    // Emit failed event
    wsClient.emitFailed({
      documentId,
      tenantId,
      stage: 'ocr',
      error: {
        code: 'OCR_FAILED',
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
    });

    // Update document status
    await db
      .update(documents)
      .set({
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    throw error;
  }
}

function generateMockExtractedText(mimeType: string): string {
  if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    return `INVOICE #INV-${Math.floor(Math.random() * 100000)}

Date: ${new Date().toLocaleDateString()}
Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

BILL TO:
Acme Corporation
123 Business St
San Francisco, CA 94105

DESCRIPTION                    QTY    RATE      AMOUNT
Professional Services          10     $150.00   $1,500.00
Software License              1      $500.00   $500.00
Consultation Fee              5      $200.00   $1,000.00

                              SUBTOTAL: $3,000.00
                              TAX (8%): $240.00
                              TOTAL: $3,240.00

Payment Terms: Net 30
Thank you for your business!`;
  }

  return 'Sample extracted text from document';
}
