import { Request, Response, NextFunction } from 'express';
import { recordApiRequest } from '../metrics';

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  // Record metrics after response is sent
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const endpoint = req.route?.path || req.path;

    recordApiRequest(req.method, endpoint, res.statusCode, duration);
  });

  next();
}
