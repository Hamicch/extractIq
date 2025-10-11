import { z } from 'zod';

/**
 * Base schema with confidence scoring for AI-extracted fields
 */
const ConfidenceScore = z.number().min(0).max(1).describe('Confidence score from 0 to 1');

const ExtractedFieldWithConfidence = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema,
    confidence: ConfidenceScore,
  });

/**
 * Legal Contract Extraction Schema
 */
export const LegalContractSchema = z.object({
  type: z.literal('legal_contract'),
  parties: z.array(
    z.object({
      name: ExtractedFieldWithConfidence(z.string()),
      role: ExtractedFieldWithConfidence(z.enum(['party_a', 'party_b', 'witness', 'notary', 'other'])),
      address: ExtractedFieldWithConfidence(z.string().optional()),
    })
  ),
  effective_date: ExtractedFieldWithConfidence(z.string().describe('ISO 8601 date format')),
  termination_date: ExtractedFieldWithConfidence(z.string().optional().describe('ISO 8601 date format')),
  payment_terms: z.object({
    amount: ExtractedFieldWithConfidence(z.number().optional()),
    currency: ExtractedFieldWithConfidence(z.string().optional()),
    schedule: ExtractedFieldWithConfidence(z.string().optional()),
  }),
  governing_law: ExtractedFieldWithConfidence(z.string()),
  key_obligations: z.array(
    z.object({
      party: ExtractedFieldWithConfidence(z.string()),
      obligation: ExtractedFieldWithConfidence(z.string()),
    })
  ).optional(),
  termination_clauses: ExtractedFieldWithConfidence(z.string().optional()),
  dispute_resolution: ExtractedFieldWithConfidence(z.string().optional()),
});

export type LegalContractExtraction = z.infer<typeof LegalContractSchema>;

/**
 * Invoice Extraction Schema
 */
export const InvoiceSchema = z.object({
  type: z.literal('invoice'),
  invoice_number: ExtractedFieldWithConfidence(z.string()),
  date: ExtractedFieldWithConfidence(z.string().describe('ISO 8601 date format')),
  due_date: ExtractedFieldWithConfidence(z.string().optional().describe('ISO 8601 date format')),
  vendor: z.object({
    name: ExtractedFieldWithConfidence(z.string()),
    address: ExtractedFieldWithConfidence(z.string().optional()),
    tax_id: ExtractedFieldWithConfidence(z.string().optional()),
    contact: ExtractedFieldWithConfidence(z.string().optional()),
  }),
  customer: z.object({
    name: ExtractedFieldWithConfidence(z.string()),
    address: ExtractedFieldWithConfidence(z.string().optional()),
    tax_id: ExtractedFieldWithConfidence(z.string().optional()),
  }).optional(),
  line_items: z.array(
    z.object({
      description: ExtractedFieldWithConfidence(z.string()),
      quantity: ExtractedFieldWithConfidence(z.number()),
      unit_price: ExtractedFieldWithConfidence(z.number()),
      amount: ExtractedFieldWithConfidence(z.number()),
    })
  ),
  subtotal: ExtractedFieldWithConfidence(z.number()),
  tax: ExtractedFieldWithConfidence(z.number().optional()),
  tax_rate: ExtractedFieldWithConfidence(z.number().optional()),
  total: ExtractedFieldWithConfidence(z.number()),
  currency: ExtractedFieldWithConfidence(z.string()),
  payment_terms: ExtractedFieldWithConfidence(z.string().optional()),
});

export type InvoiceExtraction = z.infer<typeof InvoiceSchema>;

/**
 * Generic Document Extraction Schema
 */
export const GenericDocumentSchema = z.object({
  type: z.literal('generic'),
  title: ExtractedFieldWithConfidence(z.string()),
  date: ExtractedFieldWithConfidence(z.string().optional().describe('ISO 8601 date format')),
  author: ExtractedFieldWithConfidence(z.string().optional()),
  entities: z.array(
    z.object({
      name: ExtractedFieldWithConfidence(z.string()),
      type: ExtractedFieldWithConfidence(
        z.enum(['person', 'organization', 'location', 'date', 'monetary_value', 'other'])
      ),
      context: ExtractedFieldWithConfidence(z.string().optional()),
    })
  ).optional(),
  key_points: z.array(
    z.object({
      point: ExtractedFieldWithConfidence(z.string()),
      category: ExtractedFieldWithConfidence(z.string().optional()),
    })
  ),
  summary: ExtractedFieldWithConfidence(z.string()),
  topics: z.array(ExtractedFieldWithConfidence(z.string())).optional(),
});

export type GenericDocumentExtraction = z.infer<typeof GenericDocumentSchema>;

/**
 * Union type for all extraction schemas
 */
export const DocumentExtractionSchema = z.discriminatedUnion('type', [
  LegalContractSchema,
  InvoiceSchema,
  GenericDocumentSchema,
]);

export type DocumentExtraction = z.infer<typeof DocumentExtractionSchema>;

/**
 * Document type detection result
 */
export const DocumentTypeDetectionSchema = z.object({
  detected_type: z.enum(['legal_contract', 'invoice', 'generic']),
  confidence: ConfidenceScore,
  reasoning: z.string(),
});

export type DocumentTypeDetection = z.infer<typeof DocumentTypeDetectionSchema>;

/**
 * Helper function to get schema by document type
 */
export function getSchemaForType(type: 'legal_contract' | 'invoice' | 'generic') {
  switch (type) {
    case 'legal_contract':
      return LegalContractSchema;
    case 'invoice':
      return InvoiceSchema;
    case 'generic':
      return GenericDocumentSchema;
  }
}

/**
 * Helper function to validate confidence scores across extraction
 */
export function getFieldsWithLowConfidence(
  extraction: DocumentExtraction,
  threshold: number = 0.7
): Array<{ path: string; confidence: number }> {
  const lowConfidenceFields: Array<{ path: string; confidence: number }> = [];

  function traverse(obj: any, path: string = '') {
    if (obj && typeof obj === 'object') {
      if ('value' in obj && 'confidence' in obj) {
        if (obj.confidence < threshold) {
          lowConfidenceFields.push({ path, confidence: obj.confidence });
        }
      } else {
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : key;
          traverse(value, newPath);
        }
      }
    }
  }

  traverse(extraction);
  return lowConfidenceFields;
}
