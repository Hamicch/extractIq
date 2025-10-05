import 'dotenv/config';
import { Queue } from 'bullmq';
import { QueueNames, JobNames, DocumentUploadJobData } from '@docuflow/shared';
import { db } from '@docuflow/db';
import { documents } from '@docuflow/db/schema';
import { queueConfig } from './queue/config';

async function testDocumentProcessing() {
  // Create a test document in the database
  const [document] = await db
    .insert(documents)
    .values({
      tenantId: 'acme-legal-tenant-id', // Replace with actual tenant ID from your seed data
      status: 'uploaded',
      fileUrl: 'https://example.com/test-invoice.pdf',
      fileName: 'test-invoice.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 125000,
      uploadedBy: 'test@example.com',
    })
    .returning();

  console.log('📄 Created test document:', document);

  // Create job queue
  const documentQueue = new Queue(QueueNames.DOCUMENT_PROCESSING, queueConfig);

  // Add upload job to queue
  const jobData: DocumentUploadJobData = {
    documentId: document.id,
    tenantId: document.tenantId,
    fileUrl: document.fileUrl,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSizeBytes: document.fileSizeBytes,
  };

  const job = await documentQueue.add(JobNames.DOCUMENT_UPLOAD, jobData, {
    removeOnComplete: false, // Keep for inspection
    removeOnFail: false,
  });

  console.log('✅ Added job to queue:', {
    id: job.id,
    name: job.name,
    data: job.data,
  });

  console.log('\n🔄 Job is now processing...');
  console.log('   Check the worker logs for real-time updates');
  console.log('   The job will chain through: Upload → OCR → Extract → Validate');

  // Wait a bit then close
  setTimeout(async () => {
    await documentQueue.close();
    process.exit(0);
  }, 2000);
}

testDocumentProcessing().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
