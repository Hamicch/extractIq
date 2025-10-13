export const mockDocuments = {
  invoice: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'invoice_2024_q1.pdf',
    status: 'completed' as const,
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:32:00Z',
    tenantId: 'tenant-123',
    mimeType: 'application/pdf',
    size: 245760,
    s3Key: 'documents/tenant-123/invoice_2024_q1.pdf',
    metadata: {
      pageCount: 3,
    },
  },
  contract: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'legal_contract.pdf',
    status: 'processing' as const,
    uploadedAt: '2024-01-15T11:00:00Z',
    tenantId: 'tenant-123',
    mimeType: 'application/pdf',
    size: 512000,
    s3Key: 'documents/tenant-123/legal_contract.pdf',
    metadata: {
      pageCount: 12,
    },
  },
  failed: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'corrupted_file.pdf',
    status: 'failed' as const,
    uploadedAt: '2024-01-15T12:00:00Z',
    tenantId: 'tenant-123',
    mimeType: 'application/pdf',
    size: 102400,
    s3Key: 'documents/tenant-123/corrupted_file.pdf',
    error: {
      code: 'OCR_FAILED',
      message: 'Failed to extract text from PDF',
    },
  },
};

export const mockExtractions = {
  invoice: {
    id: 'extract-001',
    documentId: mockDocuments.invoice.id,
    fields: {
      invoiceNumber: 'INV-2024-001',
      invoiceDate: '2024-01-10',
      totalAmount: 1250.0,
      vendor: 'Acme Corp',
      items: [
        { description: 'Consulting Services', quantity: 10, unitPrice: 125 },
      ],
    },
    confidence: 0.95,
    extractedAt: '2024-01-15T10:31:30Z',
  },
};

export const mockTenants = {
  free: {
    id: 'tenant-123',
    name: 'Test Company',
    plan: 'free' as const,
    createdAt: '2024-01-01T00:00:00Z',
    quota: {
      maxDocumentsPerMonth: 100,
      maxStorageGB: 5,
    },
    usage: {
      documentsThisMonth: 45,
      storageUsedGB: 2.3,
    },
  },
  pro: {
    id: 'tenant-456',
    name: 'Pro Company',
    plan: 'pro' as const,
    createdAt: '2024-01-01T00:00:00Z',
    quota: {
      maxDocumentsPerMonth: 1000,
      maxStorageGB: 50,
    },
    usage: {
      documentsThisMonth: 250,
      storageUsedGB: 12.5,
    },
  },
};

export const mockWebhookEvents = {
  documentCompleted: {
    event: 'document.processing.completed',
    timestamp: '2024-01-15T10:32:00Z',
    data: {
      documentId: mockDocuments.invoice.id,
      status: 'completed',
      extractionId: mockExtractions.invoice.id,
    },
  },
  documentFailed: {
    event: 'document.processing.failed',
    timestamp: '2024-01-15T12:05:00Z',
    data: {
      documentId: mockDocuments.failed.id,
      status: 'failed',
      error: mockDocuments.failed.error,
    },
  },
};
