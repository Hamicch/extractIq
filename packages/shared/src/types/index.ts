export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobData {
  documentId: string;
  userId: string;
  action: 'process' | 'extract' | 'analyze';
  metadata?: Record<string, unknown>;
}
