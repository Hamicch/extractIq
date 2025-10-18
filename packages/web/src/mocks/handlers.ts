import { http, HttpResponse, delay } from 'msw';
import type {
  Document,
  DocumentListResponse,
  DocumentUploadResponse,
  DocumentStatusResponse,
  ExtractedData,
  Webhook,
  Analytics,
} from '@extractiq/shared';

const BASE_URL = 'http://localhost:3001/v1';

// Mock data
const mockDocuments: Document[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'invoice-2024-001.pdf',
    size: 2048576,
    mimeType: 'application/pdf',
    status: 'completed',
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:31:00Z',
    s3Key: 'documents/123e4567-e89b-12d3-a456-426614174000.pdf',
    downloadUrl: 'https://example.com/download/123',
    metadata: {
      client: 'Acme Corp',
      invoiceNumber: 'INV-001',
    },
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'contract-draft.docx',
    size: 1524000,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'processing',
    uploadedAt: '2024-01-15T11:00:00Z',
    s3Key: 'documents/223e4567-e89b-12d3-a456-426614174000.docx',
  },
];

export const handlers = [
  // Upload document
  http.post(`${BASE_URL}/tenants/:tenantId/documents`, async () => {
    await delay(500); // Simulate network delay

    const response: DocumentUploadResponse = {
      documentId: '323e4567-e89b-12d3-a456-426614174000',
      uploadUrl: 'https://s3.amazonaws.com/presigned-url',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      status: 'uploading',
    };

    return HttpResponse.json(response, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
      },
    });
  }),

  // List documents
  http.get(`${BASE_URL}/tenants/:tenantId/documents`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 20;
    const cursor = url.searchParams.get('cursor');

    const response: DocumentListResponse = {
      data: mockDocuments.slice(0, limit),
      pagination: {
        nextCursor: cursor ? null : 'next-cursor-token',
        prevCursor: null,
        hasNext: !cursor,
        hasPrev: false,
        nextUrl: cursor
          ? null
          : `${BASE_URL}/tenants/tenant-id/documents?cursor=next-cursor-token`,
        prevUrl: null,
      },
    };

    return HttpResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '998',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
      },
    });
  }),

  // Get document
  http.get(
    `${BASE_URL}/tenants/:tenantId/documents/:documentId`,
    ({ params }) => {
      const { documentId } = params;
      const document = mockDocuments.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Document not found',
            },
          },
          { status: 404 }
        );
      }

      return HttpResponse.json(document);
    }
  ),

  // Get document status
  http.get(
    `${BASE_URL}/tenants/:tenantId/documents/:documentId/status`,
    ({ params }) => {
      const { documentId } = params;
      const document = mockDocuments.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Document not found',
            },
          },
          { status: 404 }
        );
      }

      const response: DocumentStatusResponse = {
        documentId: document.id,
        status: document.status,
        progress: document.status === 'processing' ? 65 : 100,
        estimatedCompletionAt:
          document.status === 'processing'
            ? new Date(Date.now() + 30000).toISOString()
            : undefined,
      };

      return HttpResponse.json(response);
    }
  ),

  // Get extracted data
  http.get(
    `${BASE_URL}/tenants/:tenantId/documents/:documentId/extracted-data`,
    ({ params }) => {
      const { documentId } = params;
      const document = mockDocuments.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Document not found',
            },
          },
          { status: 404 }
        );
      }

      if (document.status !== 'completed') {
        return HttpResponse.json(
          {
            error: {
              code: 'PROCESSING_NOT_COMPLETED',
              message: 'Document processing not completed yet',
            },
          },
          { status: 409 }
        );
      }

      const response: ExtractedData = {
        documentId: document.id,
        extractedAt: document.processedAt!,
        fields: {
          invoiceNumber: {
            value: 'INV-2024-001',
            confidence: 0.98,
            page: 1,
          },
          totalAmount: {
            value: 1250.0,
            confidence: 0.95,
            page: 1,
          },
          dueDate: {
            value: '2024-02-15',
            confidence: 0.92,
            page: 1,
          },
          vendor: {
            value: 'Acme Corporation',
            confidence: 0.99,
            page: 1,
          },
        },
        rawText: 'Invoice\nINV-2024-001\nTotal: $1,250.00\nDue: 02/15/2024...',
        confidence: 0.96,
        pageCount: 2,
      };

      return HttpResponse.json(response);
    }
  ),

  // Update extracted data
  http.patch(
    `${BASE_URL}/tenants/:tenantId/documents/:documentId/extracted-data`,
    async ({ request, params }) => {
      const { documentId } = params;
      const update = await request.json();

      const response: ExtractedData = {
        documentId: String(documentId),
        extractedAt: new Date().toISOString(),
        fields: {
          ...(update as any).fields,
        },
        confidence: 0.96,
        pageCount: 2,
      };

      return HttpResponse.json(response);
    }
  ),

  // Delete document
  http.delete(
    `${BASE_URL}/tenants/:tenantId/documents/:documentId`,
    ({ params }) => {
      const { documentId } = params;
      const document = mockDocuments.find((d) => d.id === documentId);

      if (!document) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Document not found',
            },
          },
          { status: 404 }
        );
      }

      return new HttpResponse(null, { status: 204 });
    }
  ),

  // Create webhook
  http.post(
    `${BASE_URL}/tenants/:tenantId/webhooks`,
    async ({ request, params }) => {
      const { tenantId } = params;
      const config = await request.json();

      const response: Webhook = {
        id: '423e4567-e89b-12d3-a456-426614174000',
        tenantId: String(tenantId),
        createdAt: new Date().toISOString(),
        lastTriggeredAt: null,
        ...(config as any),
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // Get analytics
  http.get(`${BASE_URL}/tenants/:tenantId/analytics`, ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate')!;
    const endDate = url.searchParams.get('endDate')!;
    const granularity = url.searchParams.get('granularity') || 'day';

    const response: Analytics = {
      period: {
        startDate,
        endDate,
        granularity: granularity as any,
      },
      metrics: {
        documentsProcessed: 1543,
        totalCost: 156.78,
        successRate: 0.985,
        averageProcessingTime: 12.5,
        totalPages: 8765,
      },
      timeSeries: [
        {
          timestamp: startDate,
          count: 52,
          cost: 5.23,
          successCount: 51,
          failureCount: 1,
        },
        {
          timestamp: new Date(
            new Date(startDate).getTime() + 86400000
          ).toISOString(),
          count: 48,
          cost: 4.89,
          successCount: 47,
          failureCount: 1,
        },
      ],
    };

    return HttpResponse.json(response);
  }),

  // Rate limit error example
  http.get(`${BASE_URL}/tenants/:tenantId/documents/rate-limit-test`, () => {
    return HttpResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please retry after 60 seconds',
          details: {
            retryAfter: 60,
            limit: 100,
            window: '1 minute',
          },
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
          'Retry-After': '60',
        },
      }
    );
  }),

  // Quota exceeded error example
  http.post(`${BASE_URL}/tenants/:tenantId/documents/quota-test`, () => {
    return HttpResponse.json(
      {
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Monthly document processing quota exceeded',
          quota: {
            maxDocumentsPerMonth: 1000,
            maxStorageGB: 100,
          },
          usage: {
            documentsThisMonth: 1000,
            storageUsedGB: 85.3,
          },
          upgradeUrl: 'https://docuflow.io/upgrade',
        },
      },
      { status: 402 }
    );
  }),
];
