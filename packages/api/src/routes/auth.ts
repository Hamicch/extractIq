import { Router } from 'express';
import type { ApiResponse } from '@docuflow/shared';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  // TODO: Implement user registration
  const response: ApiResponse = {
    success: true,
    data: { message: 'User registered successfully' },
  };
  res.json(response);
});

authRouter.post('/login', async (req, res) => {
  // TODO: Implement user login
  const response: ApiResponse = {
    success: true,
    data: { token: 'jwt-token-here' },
  };
  res.json(response);
});
