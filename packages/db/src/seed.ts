import { db } from './client';
import {
  tenants,
  documents,
  documentExtractions,
  processingAuditLog,
  apiKeys,
  type NewTenant,
  type NewDocument,
  type NewDocumentExtraction,
  type NewProcessingAuditLog,
  type NewApiKey,
} from './schema';
import { createHash } from 'crypto';

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Create test tenants
  const testTenants: NewTenant[] = [
    {
      name: 'acme-legal',
      apiKeyHash: hashApiKey('acme_test_key_123'),
      rateLimitPerHour: 5000,
      monthlyQuotaPages: 50000,
      webhookUrl: 'https://acme-legal.com/webhooks/docuflow',
    },
    {
      name: 'techcorp-finance',
      apiKeyHash: hashApiKey('techcorp_test_key_456'),
      rateLimitPerHour: 3000,
      monthlyQuotaPages: 30000,
      webhookUrl: 'https://techcorp.io/api/webhooks',
    },
    {
      name: 'startup-ops',
      apiKeyHash: hashApiKey('startup_test_key_789'),
      rateLimitPerHour: 1000,
      monthlyQuotaPages: 10000,
      webhookUrl: null,
    },
  ];

  const insertedTenants = await db
    .insert(tenants)
    .values(testTenants)
    .returning();
  console.log(`✅ Created ${insertedTenants.length} tenants`);

  // Create API keys for each tenant
  const testApiKeys: NewApiKey[] = insertedTenants.flatMap((tenant) => [
    {
      tenantId: tenant.id,
      keyHash: tenant.apiKeyHash,
      name: `${tenant.name} Primary Key`,
      lastUsedAt: new Date(),
    },
    {
      tenantId: tenant.id,
      keyHash: hashApiKey(`${tenant.name}_secondary_key`),
      name: `${tenant.name} Secondary Key`,
      lastUsedAt: null,
    },
  ]);

  const insertedApiKeys = await db
    .insert(apiKeys)
    .values(testApiKeys)
    .returning();
  console.log(`✅ Created ${insertedApiKeys.length} API keys`);

  // Sample document data
  const documentTypes = [
    { type: 'invoice', mime: 'application/pdf', extensions: ['.pdf'] },
    { type: 'contract', mime: 'application/pdf', extensions: ['.pdf'] },
    { type: 'receipt', mime: 'image/png', extensions: ['.png', '.jpg'] },
    { type: 'statement', mime: 'application/pdf', extensions: ['.pdf'] },
    {
      type: 'agreement',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extensions: ['.docx'],
    },
  ];

  const statuses = ['uploaded', 'processing', 'completed', 'failed'] as const;
  const uploaders = [
    'john@example.com',
    'sarah@company.com',
    'admin@startup.io',
    'system',
  ];

  // Generate 50 sample documents distributed across tenants
  const sampleDocuments: NewDocument[] = [];

  for (let i = 0; i < 50; i++) {
    const tenant = insertedTenants[i % insertedTenants.length];
    const docType = documentTypes[i % documentTypes.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const extension =
      docType.extensions[Math.floor(Math.random() * docType.extensions.length)];

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days

    sampleDocuments.push({
      tenantId: tenant.id,
      status,
      fileUrl: `https://s3.amazonaws.com/docuflow-storage/${tenant.name}/${docType.type}-${i + 1}${extension}`,
      fileName: `${docType.type}-${String(i + 1).padStart(4, '0')}${extension}`,
      fileSizeBytes: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
      mimeType: docType.mime,
      pageCount:
        status === 'completed' || status === 'processing'
          ? Math.floor(Math.random() * 20) + 1
          : null,
      uploadedBy: uploaders[Math.floor(Math.random() * uploaders.length)],
      createdAt: createdDate,
      processedAt:
        status === 'completed'
          ? new Date(createdDate.getTime() + Math.random() * 3600000)
          : null,
    });
  }

  const insertedDocuments = await db
    .insert(documents)
    .values(sampleDocuments)
    .returning();
  console.log(`✅ Created ${insertedDocuments.length} documents`);

  // Create extractions for completed documents
  const completedDocs = insertedDocuments.filter(
    (doc) => doc.status === 'completed'
  );
  const sampleExtractions: NewDocumentExtraction[] = completedDocs.map(
    (doc, idx) => {
      const extractionTypes = ['invoice', 'contract', 'receipt', 'form'];
      const extractionType = extractionTypes[idx % extractionTypes.length];

      let extractedData: Record<string, any> = {};

      switch (extractionType) {
        case 'invoice':
          extractedData = {
            invoiceNumber: `INV-${String(idx + 1).padStart(6, '0')}`,
            totalAmount: (Math.random() * 10000).toFixed(2),
            dueDate: new Date(
              Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0],
            vendor: ['Acme Corp', 'TechSupply Inc', 'Global Services'][idx % 3],
            lineItems: [
              {
                description: 'Professional Services',
                amount: (Math.random() * 1000).toFixed(2),
              },
              {
                description: 'Software License',
                amount: (Math.random() * 500).toFixed(2),
              },
            ],
          };
          break;
        case 'contract':
          extractedData = {
            contractNumber: `CTR-${String(idx + 1).padStart(6, '0')}`,
            parties: ['Company A LLC', 'Company B Inc'],
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            value: (Math.random() * 100000).toFixed(2),
          };
          break;
        case 'receipt':
          extractedData = {
            receiptNumber: `RCP-${String(idx + 1).padStart(6, '0')}`,
            merchant: ['Coffee Shop', 'Office Depot', 'Gas Station'][idx % 3],
            total: (Math.random() * 100).toFixed(2),
            date: new Date().toISOString().split('T')[0],
            items: [{ name: 'Item 1', price: (Math.random() * 50).toFixed(2) }],
          };
          break;
        default:
          extractedData = {
            formType: 'General Form',
            fields: { field1: 'value1', field2: 'value2' },
          };
      }

      return {
        documentId: doc.id,
        extractionType,
        data: extractedData,
        confidenceScore: (0.8 + Math.random() * 0.19).toFixed(2), // 0.80 to 0.99
        modelVersion: ['gpt-4-vision-preview', 'gpt-4-turbo', 'claude-3-opus'][
          idx % 3
        ],
        extractedAt: doc.processedAt || new Date(),
      };
    }
  );

  if (sampleExtractions.length > 0) {
    const insertedExtractions = await db
      .insert(documentExtractions)
      .values(sampleExtractions)
      .returning();
    console.log(
      `✅ Created ${insertedExtractions.length} document extractions`
    );
  }

  // Create audit logs for documents
  const auditLogs: NewProcessingAuditLog[] = [];

  for (const doc of insertedDocuments) {
    const stages: Array<
      'upload' | 'ocr' | 'extract' | 'validate' | 'complete'
    > = ['upload'];

    if (doc.status === 'processing' || doc.status === 'completed') {
      stages.push('ocr');
    }
    if (doc.status === 'completed') {
      stages.push('extract', 'validate', 'complete');
    }
    if (doc.status === 'failed') {
      stages.push('ocr'); // Failed during OCR
    }

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const isLast = i === stages.length - 1;
      const isFailed = doc.status === 'failed' && isLast;

      auditLogs.push({
        documentId: doc.id,
        stage,
        status: isFailed ? 'failed' : 'completed',
        durationMs: Math.floor(Math.random() * 5000) + 500, // 500ms to 5.5s
        costCents: Math.floor(Math.random() * 50) + 5, // $0.05 to $0.55
        errorMessage: isFailed
          ? 'OCR processing failed: Invalid image format'
          : null,
        createdAt: new Date(doc.createdAt.getTime() + i * 1000),
      });
    }
  }

  const insertedAuditLogs = await db
    .insert(processingAuditLog)
    .values(auditLogs)
    .returning();
  console.log(`✅ Created ${insertedAuditLogs.length} audit log entries`);

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Tenants: ${insertedTenants.length}`);
  console.log(`   - API Keys: ${insertedApiKeys.length}`);
  console.log(`   - Documents: ${insertedDocuments.length}`);
  console.log(`   - Extractions: ${sampleExtractions.length}`);
  console.log(`   - Audit Logs: ${insertedAuditLogs.length}`);
  console.log('\n🔑 Test API Keys:');
  console.log(`   - acme-legal: acme_test_key_123`);
  console.log(`   - techcorp-finance: techcorp_test_key_456`);
  console.log(`   - startup-ops: startup_test_key_789`);
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
