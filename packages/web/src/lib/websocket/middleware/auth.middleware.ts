import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AuthenticatedSocket, SocketAuthData } from '../types/socket.types';
import { createHash } from 'crypto';
import { db } from '@extractiq/db';
import { apiKeys } from '@extractiq/db/schema';
import { eq } from 'drizzle-orm';

/**
 * WebSocket authentication middleware
 * Verifies API key and attaches tenant/user info to socket
 */
export async function authMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): Promise<void> {
  try {
    const authData = socket.handshake.auth as SocketAuthData;
    const token = authData?.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Special token for worker (internal communication)
    if (
      token === process.env.WORKER_API_KEY ||
      token === 'worker-internal-key'
    ) {
      (socket as AuthenticatedSocket).tenantId = 'worker';
      (socket as AuthenticatedSocket).userId = 'worker';
      return next();
    }

    // Hash the provided API key
    const keyHash = createHash('sha256').update(token).digest('hex');

    // Look up API key in database
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    if (!apiKey) {
      return next(new Error('Invalid API key'));
    }

    // Attach tenant and user ID to socket
    (socket as AuthenticatedSocket).tenantId = apiKey.tenantId;
    (socket as AuthenticatedSocket).userId = apiKey.name;

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    next();
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    next(new Error('Authentication failed'));
  }
}
