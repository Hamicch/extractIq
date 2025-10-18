export const INVOICE_EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting structured data from invoices.

Extract the following information from the invoice:
- invoiceNumber: The invoice number
- invoiceDate: The date of the invoice (ISO 8601 format)
- dueDate: The payment due date (ISO 8601 format, if available)
- vendor: Vendor/seller information (name, address, email, phone)
- customer: Customer/buyer information (name, address, email, phone)
- items: Array of line items (description, quantity, unitPrice, total)
- subtotal: Subtotal amount (number)
- tax: Tax amount (number)
- total: Total amount (number)
- currency: Currency code (e.g., USD, EUR)
- notes: Any additional notes or terms

Return ONLY valid JSON. Use null for missing fields. Be precise with numbers and dates.`;

export const INVOICE_EXTRACTION_USER_PROMPT = (text: string) => `Extract structured data from this invoice:

${text}

Return only valid JSON matching the schema described.`;
