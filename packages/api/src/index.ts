import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupOpenTelemetry } from './telemetry';
import { documentsRouter } from './routes/documents';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error-handler';

// Setup OpenTelemetry
setupOpenTelemetry();

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Docuflow API running on port ${port}`);
});
