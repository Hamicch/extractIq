import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type {
  Document,
  DocumentListResponse,
  DocumentUploadResponse,
  DocumentStatusResponse,
  ExtractedData,
  ExtractedDataUpdate,
  Webhook,
  WebhookConfig,
  Analytics,
  TenantListResponse,
  ListDocumentsRequest,
  GetAnalyticsRequest,
  ListTenantsRequest,
  ExtractionConfig,
  ApiError,
} from './api-schemas';

export interface DocuflowClientConfig {
  baseURL: string;
  apiKey?: string;
  tenantId?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: DocuflowError) => void;
}

export class DocuflowError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: unknown,
    public field?: string
  ) {
    super(message);
    this.name = 'DocuflowError';
  }

  static fromApiError(error: ApiError, statusCode?: number): DocuflowError {
    return new DocuflowError(
      error.error.code,
      error.error.message,
      statusCode,
      error.error.details,
      error.error.field
    );
  }

  static fromAxiosError(error: AxiosError): DocuflowError {
    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.error) {
      return DocuflowError.fromApiError(apiError, error.response?.status);
    }

    return new DocuflowError(
      'NETWORK_ERROR',
      error.message || 'Network error occurred',
      error.response?.status
    );
  }
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export class DocuflowClient {
  private client: AxiosInstance;
  private config: Required<DocuflowClientConfig>;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: DocuflowClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      apiKey: config.apiKey || '',
      tenantId: config.tenantId || '',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      onError: config.onError || (() => {}),
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && {
          Authorization: `Bearer ${this.config.apiKey}`,
        }),
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add tenant ID to path if needed
        if (config.url?.includes('{tenantId}')) {
          config.url = config.url.replace('{tenantId}', this.config.tenantId);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Extract rate limit headers
        this.extractRateLimitInfo(response);
        return response;
      },
      async (error: AxiosError) => {
        // Extract rate limit headers even on error
        if (error.response) {
          this.extractRateLimitInfo(error.response);
        }

        // Handle retries
        const config = error.config as AxiosRequestConfig & {
          _retryCount?: number;
        };

        if (this.shouldRetry(error, config)) {
          config._retryCount = (config._retryCount || 0) + 1;
          await this.delay(
            this.config.retryDelay * Math.pow(2, config._retryCount - 1)
          );
          return this.client.request(config);
        }

        const docuflowError = DocuflowError.fromAxiosError(error);
        this.config.onError(docuflowError);
        return Promise.reject(docuflowError);
      }
    );
  }

  private extractRateLimitInfo(response: AxiosResponse): void {
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  private shouldRetry(
    error: AxiosError,
    config?: AxiosRequestConfig & { _retryCount?: number }
  ): boolean {
    if (!config || (config._retryCount || 0) >= this.config.maxRetries) {
      return false;
    }

    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on specific status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.response.status);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }

  public setTenantId(tenantId: string): void {
    this.config.tenantId = tenantId;
  }

  // Documents API

  async uploadDocument(
    file: File,
    options?: {
      extractionConfig?: ExtractionConfig;
      metadata?: Record<string, unknown>;
    }
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.extractionConfig) {
      formData.append(
        'extractionConfig',
        JSON.stringify(options.extractionConfig)
      );
    }

    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    const response = await this.client.post<DocumentUploadResponse>(
      `/tenants/{tenantId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async listDocuments(
    params?: ListDocumentsRequest
  ): Promise<DocumentListResponse> {
    const response = await this.client.get<DocumentListResponse>(
      `/tenants/{tenantId}/documents`,
      { params }
    );
    return response.data;
  }

  async getDocument(documentId: string): Promise<Document> {
    const response = await this.client.get<Document>(
      `/tenants/{tenantId}/documents/${documentId}`
    );
    return response.data;
  }

  async getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
    const response = await this.client.get<DocumentStatusResponse>(
      `/tenants/{tenantId}/documents/${documentId}/status`
    );
    return response.data;
  }

  async getExtractedData(documentId: string): Promise<ExtractedData> {
    const response = await this.client.get<ExtractedData>(
      `/tenants/{tenantId}/documents/${documentId}/extracted-data`
    );
    return response.data;
  }

  async updateExtractedData(
    documentId: string,
    update: ExtractedDataUpdate
  ): Promise<ExtractedData> {
    const response = await this.client.patch<ExtractedData>(
      `/tenants/{tenantId}/documents/${documentId}/extracted-data`,
      update
    );
    return response.data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.client.delete(`/tenants/{tenantId}/documents/${documentId}`);
  }

  // Webhooks API

  async createWebhook(config: WebhookConfig): Promise<Webhook> {
    const response = await this.client.post<Webhook>(
      `/tenants/{tenantId}/webhooks`,
      config
    );
    return response.data;
  }

  // Analytics API

  async getAnalytics(params: GetAnalyticsRequest): Promise<Analytics> {
    const response = await this.client.get<Analytics>(
      `/tenants/{tenantId}/analytics`,
      { params }
    );
    return response.data;
  }

  // Tenants API (Admin)

  async listTenants(params?: ListTenantsRequest): Promise<TenantListResponse> {
    const response = await this.client.get<TenantListResponse>(`/tenants`, {
      params,
    });
    return response.data;
  }
}

// Singleton instance factory
let defaultClient: DocuflowClient | null = null;

export function createDocuflowClient(
  config: DocuflowClientConfig
): DocuflowClient {
  return new DocuflowClient(config);
}

export function getDocuflowClient(): DocuflowClient {
  if (!defaultClient) {
    throw new Error(
      'Docuflow client not initialized. Call initializeDocuflowClient first.'
    );
  }
  return defaultClient;
}

export function initializeDocuflowClient(
  config: DocuflowClientConfig
): DocuflowClient {
  defaultClient = new DocuflowClient(config);
  return defaultClient;
}
