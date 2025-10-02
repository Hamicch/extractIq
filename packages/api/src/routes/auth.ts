import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/register', async (_req, res) => {
  // TODO: Implement user registration
  res.json({
    success: true,
    data: { message: 'User registered successfully' },
  });
});

authRouter.post('/login', async (_req, res) => {
  // TODO: Implement user login
  res.json({
    success: true,
    data: { token: 'jwt-token-here' },
  });
});
