/**
 * Admin API base and paths. All addon HTTP routes live under /api/internal/.
 * - GET /api/internal/admin/apps — list apps owned by the owner.
 * - GET /api/internal/admin/app/:slug — metadata for a single app (by slug or id).
 * - GET /api/internal/admin/app/:slug/logs — build and deploy logs from Railway.
 * - GET /api/internal/admin/crossapp-comms/:slug/schema|tables|tables/:table — app DB introspection.
 *
 * Base URL resolution (build-time env, same shape as `VITE_MASTER_AUTH_URL` fan-out in `main.tsx`):
 *   1. `VITE_MASTER_ADMIN_URL` — explicit override for the admin addon base.
 *   2. `VITE_MASTER_AUTH_URL` — if set (e.g. `https://master/auth`), swap trailing `/auth` → `/api/internal/admin`.
 *   3. Fallback: same-origin `/api/internal/admin`.
 *
 * This matters because tenant admin panels (fan-out) must call *master's* admin API — tenants only
 * carry project-scoped Railway tokens that Railway GraphQL rejects as "Not Authorized" for
 * cross-service log / deployment queries. Master has the account token and the Railway reach.
 * CORS: master's `MASTER_CORS_ORIGINS` must list every tenant origin (rule-of-law 2026-04-21
 * Asmaster architecture); auth uses the master JWT the admin SPA already holds from `/auth/login`.
 */
function resolveAdminApiBase(): string {
  const env =
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: Record<string, string | undefined> }).env) ||
    {};
  const explicit = (env.VITE_MASTER_ADMIN_URL || '').trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  const auth = (env.VITE_MASTER_AUTH_URL || '').trim().replace(/\/+$/, '');
  if (auth && /\/auth$/.test(auth)) {
    return auth.replace(/\/auth$/, '/api/internal/admin');
  }
  return '/api/internal/admin';
}

/** Base path for all admin internal API routes (resolved at module load). */
export const ADMIN_API_BASE: string = resolveAdminApiBase();

/** Build an absolute admin API URL. `path` MUST start with `/`. */
export function adminUrl(path: string): string {
  if (!path.startsWith('/')) path = '/' + path;
  return `${ADMIN_API_BASE}${path}`;
}

/**
 * URL for listing apps owned by the current owner (GET).
 * @returns Full URL for GET /api/internal/admin/apps
 */
export function getAppsUrl(): string {
  return `${ADMIN_API_BASE}/apps`;
}

/**
 * URL for fetching a single app by slug or id (GET).
 * @param slugOrId - App slug or id
 * @returns Full URL for GET /api/internal/admin/app/:slugOrId
 */
export function getAppUrl(slugOrId: string): string {
  return `${ADMIN_API_BASE}/app/${encodeURIComponent(slugOrId)}`;
}

/**
 * URL for build/deploy logs for an app (GET). Optional environment query.
 * @param slugOrId - App slug or id
 * @param environment - Optional environment filter (e.g. production, staging)
 * @returns Full URL for GET /api/internal/admin/app/:slugOrId/logs
 */
export function getAppLogsUrl(slugOrId: string, environment?: string): string {
  const base = `${ADMIN_API_BASE}/app/${encodeURIComponent(slugOrId)}/logs`;
  if (environment) {
    return `${base}?environment=${encodeURIComponent(environment)}`;
  }
  return base;
}

/**
 * URL for a specific deployment's build and runtime logs (GET).
 * @param slugOrId - App slug or id
 * @param deploymentId - Deployment id from the logs list
 * @returns Full URL for GET /api/internal/admin/app/:slugOrId/deployments/:deploymentId/logs
 */
export function getAppDeploymentLogsUrl(slugOrId: string, deploymentId: string): string {
  return `${ADMIN_API_BASE}/app/${encodeURIComponent(slugOrId)}/deployments/${encodeURIComponent(deploymentId)}/logs`;
}

/**
 * URL for crossapp-comms DB schema (tables and columns) for an app (GET).
 * @param slug - App slug
 * @returns Full URL for GET /api/internal/admin/crossapp-comms/:slug/schema
 */
export function getCrossappCommsSchemaUrl(slug: string): string {
  return `${ADMIN_API_BASE}/crossapp-comms/${encodeURIComponent(slug)}/schema`;
}

/**
 * URL for listing tables in crossapp-comms for an app (GET).
 * @param slug - App slug
 * @returns Full URL for GET /api/internal/admin/crossapp-comms/:slug/tables
 */
export function getCrossappCommsTablesUrl(slug: string): string {
  return `${ADMIN_API_BASE}/crossapp-comms/${encodeURIComponent(slug)}/tables`;
}

/**
 * URL for table data in crossapp-comms for an app (GET).
 * @param slug - App slug
 * @param table - Table name
 * @returns Full URL for GET /api/internal/admin/crossapp-comms/:slug/tables/:table
 */
export function getCrossappCommsTableDataUrl(slug: string, table: string): string {
  return `${ADMIN_API_BASE}/crossapp-comms/${encodeURIComponent(slug)}/tables/${encodeURIComponent(table)}`;
}
