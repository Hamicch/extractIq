export const TYPE_DETECTION_SYSTEM_PROMPT = `You are a document classification expert. Your task is to analyze document text and classify it into one of these categories:

1. **invoice** - Bills, invoices, payment requests
2. **contract** - Legal agreements, contracts, terms of service
3. **receipt** - Purchase receipts, transaction records
4. **generic** - Any other type of document

Return a JSON object with:
- type: one of [invoice, contract, receipt, generic]
- confidence: a number between 0 and 1 indicating your confidence

Be accurate and conservative with confidence scores.`;

export const TYPE_DETECTION_USER_PROMPT = (text: string) => `Classify this document:

${text.substring(0, 2000)}

Return only valid JSON with "type" and "confidence" fields.`;
