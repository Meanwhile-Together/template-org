/**
 * Admin apps context: fetches GET /api/internal/admin/apps with auth for dynamic sidebar and Apps view.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@meanwhile-together/shared';
import { getAppsUrl } from '../data/adminApi';

/**
 * App record returned by GET /api/internal/admin/apps.
 */
export interface AdminAppFromApi {
  /** Unique app id. */
  id: string;
  /** URL-friendly slug. */
  slug: string;
  /** Display name. */
  name: string;
}

interface AdminAppsState {
  apps: AdminAppFromApi[];
  loading: boolean;
  error: string | null;
}

interface AdminAppsContextValue extends AdminAppsState {
  refetch: () => Promise<void>;
}

const AdminAppsContext = createContext<AdminAppsContextValue | undefined>(undefined);

/**
 * Provider that fetches GET /api/internal/admin/apps when authenticated and exposes apps, loading, error, and refetch.
 * Wrap the admin app (e.g. Layout) so useAdminApps() and useViews()/useGetViewComponent() can use API apps for drill-down.
 *
 * @param props - Component props
 * @param props.children - Child tree (e.g. router/Layout)
 * @returns Provider wrapping children
 */
export function AdminAppsProvider({ children }: { children: React.ReactNode }) {
  const { getAuthToken, isAuthenticated, loading: authLoading } = useAuth();
  const [apps, setApps] = useState<AdminAppFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      setApps([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(getAppsUrl(), { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.error || `Failed to load apps (${res.status})`);
        setApps([]);
        return;
      }
      const data = (await res.json()) as { apps: AdminAppFromApi[] };
      setApps(data.apps ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load apps';
      setError(message);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, isAuthenticated, authLoading]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const value: AdminAppsContextValue = { apps, loading, error, refetch: fetchApps };

  return (
    <AdminAppsContext.Provider value={value}>
      {children}
    </AdminAppsContext.Provider>
  );
}

/**
 * Hook to access admin apps state from AdminAppsContext. Must be used within AdminAppsProvider.
 *
 * @returns { apps, loading, error, refetch } — list of apps from API, loading flag, error message, and refetch function
 */
export function useAdminApps(): AdminAppsContextValue {
  const ctx = useContext(AdminAppsContext);
  if (ctx === undefined) {
    throw new Error('useAdminApps must be used within AdminAppsProvider');
  }
  return ctx;
}
