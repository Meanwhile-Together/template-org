/**
 * Admin apps context — **bootstrap-sourced**. Exposes the payloads registered on the host that
 * is serving the admin panel (the unit the SPA routes against), derived from `useAppConfig()`'s
 * `payloads` array which the server populates from `/api/config`.
 *
 * Pre-2026-04-21 this context fetched `GET /api/internal/admin/apps` (Railway projects the
 * signed-in master user owned) and fed them into the Apps view and sidebar drill-down. That
 * was wrong for two reasons:
 *   1. A non-master tenant admin was looking at other orgs' deploys — or (if they had no
 *      platform permissions) a silent 401 with "No apps yet" masking a broken fetch.
 *   2. The tenant-facing "Apps" surface SHOULD mean "the payload apps installed in this org's
 *      host" — admin, vibe-check, whatever `config/server.json` has — not a platform-level
 *      Railway inventory.
 *
 * The Railway list still exists but now lives in `MasterClientsContext` / the `master-clients`
 * view, behind the master gate (`useMaster().isMaster === true`). See rule-of-law §1
 * "Apps/Clients split (bootstrap vs Railway)".
 *
 * Shape stays `{ id, slug, name }` so existing callers (`Dashboard`, sidebar drill-down in
 * `views/index.ts`) keep working without signature changes. Additional bootstrap fields
 * (mountBase, apiPrefix, description) live on `ClientPayloadIdentity` and are available via
 * `useAppConfig().payloads` directly for views that need them (e.g. the new Apps view).
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAppConfig } from '@meanwhile-together/shared';

/**
 * Admin app record surfaced to the admin UI. Derived from `ClientPayloadIdentity` — kept as
 * `{ id, slug, name }` for backward compat with existing callers (views/index.ts,
 * Dashboard). The full identity (including `mountBase`, `apiPrefix`, `description`) is
 * available via `useAppConfig().payloads` for views that need to link / inspect.
 */
export interface AdminAppFromApi {
  /** Unique payload id (e.g. `"payload-admin"`, `"payload-vibe-check"`). */
  id: string;
  /** URL-friendly slug (e.g. `"admin"`, `"vibe-check"`). */
  slug: string;
  /** Display name. */
  name: string;
}

interface AdminAppsContextValue {
  apps: AdminAppFromApi[];
  /** Always false — bootstrap config is delivered alongside the SPA. Kept for call-site parity. */
  loading: boolean;
  /** Always null — bootstrap can't fail once the SPA has mounted. Kept for call-site parity. */
  error: string | null;
  /** No-op — the source is a synchronous config snapshot. Kept for call-site parity. */
  refetch: () => Promise<void>;
}

const AdminAppsContext = createContext<AdminAppsContextValue | undefined>(undefined);

/**
 * Provides the bootstrap payload list as `{ apps, loading: false, error: null, refetch: noop }`.
 * Wrap the admin app (inside `ConfigProvider`) so `useAdminApps()` and `useViews()` /
 * `useGetViewComponent()` can use the bootstrap-sourced apps for the Apps view and sidebar.
 *
 * @param props - Component props
 * @param props.children - Child tree (e.g. router/Layout)
 * @returns Provider wrapping children
 */
export function AdminAppsProvider({ children }: { children: React.ReactNode }) {
  const { payloads } = useAppConfig();
  const apps = useMemo<AdminAppFromApi[]>(() => {
    // Defensive: `payloads` is typed as `ClientPayloadIdentity[]` but the ConfigContext
    // falls back to `[]` when `/api/config` hasn't responded yet — so this is always an
    // array. Map to the narrower UI shape and skip any entry missing required fields.
    return payloads
      .filter((p) => typeof p.id === 'string' && typeof p.slug === 'string' && typeof p.name === 'string')
      .map((p) => ({ id: p.id, slug: p.slug, name: p.name }));
  }, [payloads]);

  const value: AdminAppsContextValue = {
    apps,
    loading: false,
    error: null,
    refetch: async () => {
      // Bootstrap config is immutable for the life of the page — there's nothing to re-fetch.
      // Callers that want a fresh roster should reload the SPA (which re-hits `/api/config`).
    },
  };

  return <AdminAppsContext.Provider value={value}>{children}</AdminAppsContext.Provider>;
}

/**
 * Hook to access bootstrap-sourced admin apps.
 * Must be used within `AdminAppsProvider`.
 *
 * @returns { apps, loading, error, refetch } — tenant payload list from `/api/config`
 */
export function useAdminApps(): AdminAppsContextValue {
  const ctx = useContext(AdminAppsContext);
  if (ctx === undefined) {
    throw new Error('useAdminApps must be used within AdminAppsProvider');
  }
  return ctx;
}
