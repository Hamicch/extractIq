import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupOpenTelemetry } from './telemetry';
import { documentsRouter } from './routes/documents';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error-handler';
import { WebSocketServer } from './websocket/server';

// Setup OpenTelemetry
setupOpenTelemetry();

const app = express();
const httpServer = createServer(app);
const port = process.env.API_PORT || 4000;

// Initialize WebSocket server
const wsServer = new WebSocketServer(httpServer);

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

// WebSocket stats endpoint
app.get('/api/websocket/stats', (_req, res) => {
  const clients = wsServer.getAllConnectedClients();
  const stats = {
    totalConnections: Array.from(clients.values()).reduce((a, b) => a + b, 0),
    tenants: Object.fromEntries(clients),
  };
  res.json(stats);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

// Error handling
app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(`🚀 Docuflow API running on port ${port}`);
  console.log(`📡 WebSocket server ready for connections`);
});
