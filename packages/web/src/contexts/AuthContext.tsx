'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, type User } from '@/lib/store';
import { initializeDocuflowClient } from '@extractiq/shared/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const apiKey = localStorage.getItem('extract_iq_api_key');
        if (!apiKey) {
          setIsLoading(false);
          return;
        }

        // Verify API key with backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Map fullName to name for UI compatibility
          setUser({
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.fullName || data.data.user.email,
            role: data.data.user.role,
          });
        } else {
          localStorage.removeItem('extract_iq_api_key');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Store token as API key
      localStorage.setItem('extract_iq_api_key', data.data.token);

      // Set user in store (map fullName to name for UI compatibility)
      setUser({
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.fullName || data.data.user.email,
        role: data.data.user.role,
      });

      // Reinitialize API client with token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      initializeDocuflowClient({
        baseURL: apiUrl,
        apiKey: data.data.token,
      });

      // Redirect to dashboard
      router.push('/documents');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, firstName, lastName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Registration failed');
      }

      const data = await response.json();

      // Store token as API key
      localStorage.setItem('extract_iq_api_key', data.data.token);

      // Set user in store (map fullName to name for UI compatibility)
      setUser({
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.fullName || data.data.user.email,
        role: data.data.user.role,
      });

      // Reinitialize API client with token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      initializeDocuflowClient({
        baseURL: apiUrl,
        apiKey: data.data.token,
      });

      // Redirect to dashboard
      router.push('/documents');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (for analytics/logging)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('extract_iq_api_key')}`,
          },
        });
      } catch (error) {
        // Ignore API errors - still logout client-side
        console.warn('Logout API call failed:', error);
      }

      // Clear API key
      localStorage.removeItem('extract_iq_api_key');

      // Clear user
      setUser(null);

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
