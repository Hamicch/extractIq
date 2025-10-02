# Docuflow API

AI-native document intelligence REST API built with Express and OpenAPI 3.1.

## OpenAPI Specification

The full API specification is defined in [openapi-spec.yaml](./openapi-spec.yaml).

### Key Features

- **Multi-tenant architecture** with tenant-scoped endpoints
- **Rate limiting** with headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- **Cursor-based pagination** for scalable list operations
- **Webhook support** for real-time event notifications
- **Comprehensive error handling** with structured error codes
- **Quota management** with 402 Payment Required responses

## Endpoints

### Documents

- `POST /v1/tenants/{tenantId}/documents` - Upload document (max 50MB)
- `GET /v1/tenants/{tenantId}/documents` - List documents with filtering
- `GET /v1/tenants/{tenantId}/documents/{docId}` - Get document details
- `GET /v1/tenants/{tenantId}/documents/{docId}/status` - Poll processing status
- `GET /v1/tenants/{tenantId}/documents/{docId}/extracted-data` - Get extracted data
- `PATCH /v1/tenants/{tenantId}/documents/{docId}/extracted-data` - Update extracted fields
- `DELETE /v1/tenants/{tenantId}/documents/{docId}` - Delete document

### Webhooks

- `POST /v1/tenants/{tenantId}/webhooks` - Configure webhook URL

### Analytics

- `GET /v1/tenants/{tenantId}/analytics` - Usage stats and costs

### Tenants (Admin)

- `GET /v1/tenants` - List all tenants

## Type Generation

TypeScript types are automatically generated from the OpenAPI spec:

```bash
cd packages/shared
npm run generate:types
```

This creates `packages/shared/src/api-types.ts` with all types from the OpenAPI spec.

## Client Usage

See `@docuflow/shared` package for the API client and React Query hooks.

## Development

### Start the API server

```bash
npm run dev
```

### View OpenAPI documentation

You can view the interactive API documentation by:

1. Opening [openapi-spec.yaml](./openapi-spec.yaml) in [Swagger Editor](https://editor.swagger.io/)
2. Using a VSCode extension like [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <your-api-key>
```

## Rate Limiting

API requests are rate-limited per tenant. Check these response headers:

- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Unix timestamp when limit resets

## Error Handling

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "field": "fieldName"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid request parameters
- `UNAUTHORIZED` - Invalid/missing auth token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `QUOTA_EXCEEDED` - Tenant quota exceeded (402)
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded (429)
- `PAYLOAD_TOO_LARGE` - File exceeds 50MB (413)
- `INTERNAL_ERROR` - Server error (500)

## Webhook Events

Configure webhooks to receive these events:

- `document.processing.completed`
- `document.processing.failed`
- `document.uploaded`
- `document.deleted`

### Webhook Payload

```json
{
  "event": "document.processing.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "documentId": "uuid",
    "tenantId": "uuid",
    "status": "completed",
    "processedAt": "2024-01-15T10:30:00Z",
    "extractedDataUrl": "https://api.docuflow.io/v1/tenants/uuid/documents/uuid/extracted-data"
  },
  "signature": "hmac-sha256-signature"
}
```

## License

MIT
