import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const handlers = [
  // Documents
  http.get(`${API_URL}/api/documents`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'test-document.pdf',
          status: 'completed',
          uploadedAt: '2024-01-15T10:00:00Z',
          size: 245760,
          tenantId: 'tenant-1',
          mimeType: 'application/pdf',
          s3Key: 'documents/test.pdf',
          metadata: { pageCount: 3 },
        },
      ],
      pagination: {
        nextCursor: null,
        prevCursor: null,
        hasNext: false,
        hasPrev: false,
      },
    });
  }),

  http.get(`${API_URL}/api/documents/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'test-document.pdf',
      status: 'completed',
      uploadedAt: '2024-01-15T10:00:00Z',
      size: 245760,
      tenantId: 'tenant-1',
      mimeType: 'application/pdf',
      s3Key: 'documents/test.pdf',
      metadata: { pageCount: 3 },
    });
  }),

  http.post(`${API_URL}/api/upload`, () => {
    return HttpResponse.json({
      documentId: 'new-doc-123',
      uploadUrl: 'https://s3.amazonaws.com/upload-url',
      expiresAt: '2024-01-15T11:00:00Z',
      status: 'uploading',
    });
  }),

  // Analytics
  http.get(`${API_URL}/api/analytics`, () => {
    return HttpResponse.json({
      metrics: {
        documentsProcessed: 150,
        successRate: 0.94,
        totalPages: 450,
        totalCost: 12500,
      },
      timeSeries: [
        { date: '2024-01-01', documents: 45, cost: 120 },
        { date: '2024-01-02', documents: 52, cost: 145 },
      ],
    });
  }),

  // Tenants
  http.get(`${API_URL}/api/tenants`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'tenant-1',
          name: 'Test Tenant',
          plan: 'free',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        nextCursor: null,
        prevCursor: null,
        hasNext: false,
        hasPrev: false,
      },
    });
  }),

  // Auth
  http.post(`${API_URL}/api/auth/login`, () => {
    return HttpResponse.json({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      },
      apiKey: 'test-api-key',
    });
  }),
];
