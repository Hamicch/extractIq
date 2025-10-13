import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  quotaUsed: number;
  quotaLimit: number;
  createdAt?: string;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Tenant
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;

  // Theme is handled by next-themes, but we can track preference
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Tenant
      selectedTenant: null,
      setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),

      // UI State
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'docuflow-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        selectedTenant: state.selectedTenant,
      }),
    }
  )
);
