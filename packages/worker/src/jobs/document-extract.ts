import { Job } from 'bullmq';
import { db, eq, and } from '@docuflow/db';
import { documentExtractions, processingAuditLog } from '@docuflow/db/schema';
import OpenAI from 'openai';
import type {
  DocumentExtractJobData,
  DocumentExtractResult,
} from '@docuflow/shared';
import { wsClient } from '../websocket/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Token pricing (as of 2024, prices in cents per 1K tokens)
const TOKEN_PRICING = {
  'gpt-4-turbo': {
    prompt: 1.0, // $0.01 per 1K tokens
    completion: 3.0, // $0.03 per 1K tokens
  },
  'gpt-4': {
    prompt: 3.0,
    completion: 6.0,
  },
  'gpt-3.5-turbo': {
    prompt: 0.05,
    completion: 0.15,
  },
};

const EXTRACTION_SCHEMAS = {
  invoice: {
    type: 'object',
    properties: {
      invoiceNumber: { type: 'string' },
      date: { type: 'string', format: 'date' },
      dueDate: { type: 'string', format: 'date' },
      vendor: { type: 'string' },
      billTo: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
        },
      },
      lineItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            quantity: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
          },
        },
      },
      subtotal: { type: 'number' },
      tax: { type: 'number' },
      total: { type: 'number' },
    },
    required: ['invoiceNumber', 'date', 'vendor', 'total'],
  },
  contract: {
    type: 'object',
    properties: {
      contractNumber: { type: 'string' },
      parties: { type: 'array', items: { type: 'string' } },
      effectiveDate: { type: 'string', format: 'date' },
      expirationDate: { type: 'string', format: 'date' },
      value: { type: 'number' },
      terms: { type: 'string' },
    },
    required: ['contractNumber', 'parties', 'effectiveDate'],
  },
  receipt: {
    type: 'object',
    properties: {
      receiptNumber: { type: 'string' },
      merchant: { type: 'string' },
      date: { type: 'string', format: 'date' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
          },
        },
      },
      total: { type: 'number' },
      paymentMethod: { type: 'string' },
    },
    required: ['merchant', 'date', 'total'],
  },
  form: {
    type: 'object',
    properties: {
      formType: { type: 'string' },
      fields: { type: 'object' },
    },
    required: ['formType'],
  },
};

export async function processDocumentExtract(
  job: Job<DocumentExtractJobData>
): Promise<DocumentExtractResult> {
  const { documentId, tenantId, extractedText, extractionType, modelVersion } =
    job.data;
  const startTime = Date.now();

  try {
    // Idempotency check: Skip if extraction already exists for this model version
    const existingExtraction = await db
      .select()
      .from(documentExtractions)
      .where(
        and(
          eq(documentExtractions.documentId, documentId),
          eq(documentExtractions.modelVersion, modelVersion)
        )
      )
      .limit(1);

    if (existingExtraction.length > 0) {
      console.log(
        `⏭️  Extraction already exists for document ${documentId} with model ${modelVersion}`
      );

      const extraction = existingExtraction[0];
      return {
        documentId,
        extractionId: extraction.id,
        data: extraction.data as Record<string, unknown>,
        confidenceScore: extraction.confidenceScore,
        tokensUsed: {
          prompt: 0,
          completion: 0,
          total: 0,
        },
        costCents: 0,
      };
    }

    // Emit progress: 0%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'extract',
      progress: 0,
      message: 'Preparing extraction',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(0);

    // Emit progress: 25%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'extract',
      progress: 25,
      message: 'Analyzing document structure',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(25);

    // Get extraction schema
    const schema =
      EXTRACTION_SCHEMAS[extractionType as keyof typeof EXTRACTION_SCHEMAS];
    const systemPrompt = `You are an AI document extraction expert. Extract structured data from the provided document text according to the JSON schema. Return only valid JSON matching the schema. Be precise and extract all available information.`;

    const userPrompt = `Extract data from this ${extractionType} document:

${extractedText}

Return the extracted data as JSON matching this schema:
${JSON.stringify(schema, null, 2)}`;

    // Emit progress: 50%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'extract',
      progress: 50,
      message: 'Calling AI model',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(50);

    // Call OpenAI with retry logic for rate limits
    let completion;
    let attemptCount = 0;
    const maxAttempts = 3;

    while (attemptCount < maxAttempts) {
      try {
        completion = await openai.chat.completions.create({
          model: modelVersion,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        break; // Success, exit retry loop
      } catch (error: any) {
        attemptCount++;

        // Handle rate limit (429) with exponential backoff + jitter
        if (error?.status === 429 && attemptCount < maxAttempts) {
          const baseDelay = Math.pow(2, attemptCount) * 1000; // 2s, 4s, 8s
          const jitter = Math.random() * 1000; // 0-1s random jitter
          const delay = baseDelay + jitter;

          console.log(
            `⏳ Rate limited, retrying in ${Math.floor(delay)}ms (attempt ${attemptCount}/${maxAttempts})`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error; // Rethrow if not rate limit or max attempts reached
      }
    }

    if (!completion) {
      throw new Error('Failed to get completion from OpenAI after retries');
    }

    // Emit progress: 75%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'extract',
      progress: 75,
      message: 'Processing results',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(75);

    // Parse extracted data
    const extractedData = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    // Calculate token usage
    const tokensUsed = {
      prompt: completion.usage?.prompt_tokens || 0,
      completion: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0,
    };

    // Calculate cost in cents
    const modelPricing =
      TOKEN_PRICING[modelVersion as keyof typeof TOKEN_PRICING] ||
      TOKEN_PRICING['gpt-4-turbo'];
    const costCents = Math.ceil(
      (tokensUsed.prompt / 1000) * modelPricing.prompt +
        (tokensUsed.completion / 1000) * modelPricing.completion
    );

    // Calculate confidence score (based on completeness of required fields)
    const confidenceScore = calculateConfidenceScore(extractedData, schema);

    // Save extraction to database
    const [insertion] = await db
      .insert(documentExtractions)
      .values({
        documentId,
        extractionType,
        data: extractedData,
        confidenceScore: confidenceScore.toFixed(2),
        modelVersion,
        metadata: {
          tokensUsed,
          costCents,
          attemptCount,
        },
        extractedAt: new Date(),
      })
      .returning();

    const durationMs = Date.now() - startTime;

    // Log to audit
    await db.insert(processingAuditLog).values({
      documentId,
      stage: 'extract',
      status: 'completed',
      durationMs,
      costCents,
      metadata: {
        tokensUsed,
        modelVersion,
        confidenceScore,
        attemptCount,
      },
      createdAt: new Date(),
    });

    // Emit progress: 100%
    wsClient.emitProgress({
      documentId,
      tenantId,
      stage: 'extract',
      progress: 100,
      message: 'Extraction completed',
      timestamp: new Date().toISOString(),
    });

    await job.updateProgress(100);

    return {
      documentId,
      extractionId: insertion.id,
      data: extractedData,
      confidenceScore: confidenceScore.toFixed(2),
      tokensUsed,
      costCents,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const durationMs = Date.now() - startTime;

    // Log failure to audit
    await db.insert(processingAuditLog).values({
      documentId,
      stage: 'extract',
      status: 'failed',
      durationMs,
      errorMessage,
      createdAt: new Date(),
    });

    // Emit failed event
    wsClient.emitFailed({
      documentId,
      tenantId,
      stage: 'extract',
      error: {
        code: 'EXTRACTION_FAILED',
        message: errorMessage,
        details: {
          modelVersion,
          attemptCount: job.attemptsMade,
        },
      },
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

function calculateConfidenceScore(
  data: Record<string, any>,
  schema: any
): number {
  const requiredFields = schema.required || [];
  const totalFields = Object.keys(schema.properties || {}).length;

  if (totalFields === 0) return 1.0;

  let filledRequiredFields = 0;
  let filledOptionalFields = 0;

  for (const field of requiredFields) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      data[field] !== ''
    ) {
      filledRequiredFields++;
    }
  }

  const optionalFields = Object.keys(schema.properties).filter(
    (f) => !requiredFields.includes(f)
  );

  for (const field of optionalFields) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      data[field] !== ''
    ) {
      filledOptionalFields++;
    }
  }

  // Weight required fields at 70%, optional at 30%
  const requiredScore =
    requiredFields.length > 0
      ? (filledRequiredFields / requiredFields.length) * 0.7
      : 0.7;
  const optionalScore =
    optionalFields.length > 0
      ? (filledOptionalFields / optionalFields.length) * 0.3
      : 0.3;

  return Math.min(requiredScore + optionalScore, 0.99);
}
