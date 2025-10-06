'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/lib/store';

interface WebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onDocumentUpdate?: (data: any) => void;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000,
    onDocumentUpdate,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const selectedTenant = useAppStore((state) => state.selectedTenant);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    socketRef.current = io(apiUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: reconnectAttempts,
      reconnectionDelay: reconnectDelay,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setReconnectCount(0);

      // Join tenant room if tenant is selected
      if (selectedTenant) {
        socketRef.current?.emit('join:tenant', selectedTenant.id);
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn('WebSocket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setReconnectCount((prev) => prev + 1);
    });

    // Listen for document updates
    if (onDocumentUpdate) {
      socketRef.current.on('document:update', onDocumentUpdate);
    }
  }, [reconnectAttempts, reconnectDelay, selectedTenant, onDocumentUpdate]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Subscribe to events
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  // Unsubscribe from events
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    socketRef.current?.off(event, handler);
  }, []);

  // Emit events
  const emit = useCallback((event: string, ...args: any[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Rejoin tenant room when tenant changes
  useEffect(() => {
    if (isConnected && selectedTenant) {
      socketRef.current?.emit('join:tenant', selectedTenant.id);
    }
  }, [selectedTenant, isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    reconnectCount,
    connect,
    disconnect,
    on,
    off,
    emit,
  };
}
