/**
 * Admin package: same view system contract as application (getViews, getViewComponent, payload).
 * Backend and any consumer use engine default nav (expandable); no custom SidebarContent.
 * When wrapped with AdminAppsProvider, use useViews and useGetViewComponent for dynamic app drill-down.
 */
export { NotificationsBell } from './components/NotificationsBell';
export { getViews, getViewComponent, getStaticViewDefinitions, useViews, useGetViewComponent } from './views';
export { AdminAppsProvider, useAdminApps } from './contexts/AdminAppsContext';
export type { AdminAppFromApi } from './contexts/AdminAppsContext';
import type { ViewDefinition } from '@meanwhile-together/shared';
import type { PayloadEntry } from '@meanwhile-together/shared/types';
import type React from 'react';
import { getViewComponent as getViewComponentFromViews, getStaticViewDefinitions } from './views';

/**
 * Contract for the admin app payload: view discovery, component resolution, initial view, and auth requirement.
 */
export interface AppPayload {
  /** Returns the list of view definitions for the sidebar/nav. */
  getViews: () => ViewDefinition[];
  /** Returns the React component for a view id, or undefined if not found. */
  getViewComponent: (id: string) => React.ComponentType<{ theme?: 'light' | 'dark'; bridge?: unknown }> | undefined;
  /** Initial view id when the app loads (e.g. 'landing'). */
  initialViewId: string;
  /**
   * UX hint passed through to {@link Layout.promptSignInWhenBlocked}. When a
   * logged-out user hits a view with `needAuthorization: true`, pop the
   * sign-in screen instead of silently redirecting. **Not** an access guard —
   * the per-view `needAuthorization` flag is the sole gate.
   */
  promptSignInWhenBlocked: boolean;
}

/**
 * Payload with static views only (for createAppEntry when using useViews in Layout).
 * Use when AdminAppsProvider wraps the app and dynamic app drill-down is provided by useViews/useGetViewComponent.
 */
export const adminPayload: AppPayload = {
  getViews: getStaticViewDefinitions,
  getViewComponent: getViewComponentFromViews,
  initialViewId: 'landing',
  promptSignInWhenBlocked: true,
};

/**
 * Admin payload schema for server config (config/server.json).
 * Backend service = admin payload + backend addons (optionally master).
 * Use this shape in server.apps so the unified server mounts admin static and backend addons.
 * source.path should point to the built admin SPA (this repo's dist, e.g. ../admin-payload/dist).
 */
export const ADMIN_PAYLOAD_SLUG = 'admin' as const;
export const adminPayloadSchema: PayloadEntry = {
  id: 'admin',
  name: 'Admin',
  slug: ADMIN_PAYLOAD_SLUG,
  pathPrefix: '/',
  staticDir: 'dist',
  apiPrefix: '/api',
  runAsMaster: false,
  app: { name: 'Admin', slug: 'admin', version: '1.0.0' },
  source: { path: '.' },
};
