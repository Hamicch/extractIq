export const GENERIC_EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting structured data from documents.

Extract key information from the document including:
- title: Document title
- date: Document date (ISO 8601)
- author: Document author/creator
- summary: Brief summary (2-3 sentences)
- keyPoints: Array of main points or topics
- entities: Named entities (people, organizations, locations)
- metadata: Any other relevant metadata

Return ONLY valid JSON. Use null for missing fields. Be comprehensive but accurate.`;

export const GENERIC_EXTRACTION_USER_PROMPT = (text: string) => `Extract structured data from this document:

${text}

Return only valid JSON matching the schema described.`;
