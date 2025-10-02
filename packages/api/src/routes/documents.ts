import { Router } from 'express';
import type { ApiResponse, PaginatedResponse, Document } from '@docuflow/shared';

export const documentsRouter = Router();

documentsRouter.get('/', async (req, res) => {
  // TODO: Implement document listing with pagination
  const response: ApiResponse<PaginatedResponse<Document>> = {
    success: true,
    data: {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
  };
  res.json(response);
});

documentsRouter.post('/', async (req, res) => {
  // TODO: Implement document upload
  const response: ApiResponse = {
    success: true,
    data: { message: 'Document uploaded successfully' },
  };
  res.json(response);
});

documentsRouter.get('/:id', async (req, res) => {
  // TODO: Implement document retrieval
  const response: ApiResponse = {
    success: true,
    data: { id: req.params.id },
  };
  res.json(response);
});

documentsRouter.delete('/:id', async (req, res) => {
  // TODO: Implement document deletion
  const response: ApiResponse = {
    success: true,
    data: { message: 'Document deleted successfully' },
  };
  res.json(response);
});
