/**
 * Drill-down page for a single app. Resolves app from API (GET /api/internal/admin/app/:slug) or mock.
 * Access, Status, Settings, Usage, Activity, Deploy/build logs, DB browser (optional crossapp-comms), AI placeholder, support disclaimer.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@meanwhile-together/shared';
import { getAppById, DEVICE_OPTIONS } from '../data/mockApps';
import type { DeviceType } from '../data/mockApps';
import { getActivityForApp, formatActivityTime } from '../data/mockActivity';
import type { ActivityItem } from '../data/mockActivity';
import { getAppUrl, getAppLogsUrl, getAppDeploymentLogsUrl, getCrossappCommsSchemaUrl, getCrossappCommsTableDataUrl } from '../data/adminApi';
import ActivityFeedItem from './ActivityFeedItem';

/** Normalized app shape for the template (API returns id, slug, name; we add defaults for optional fields). */
interface DisplayApp {
  id: string;
  name: string;
  slug: string;
  health: string;
  status: string;
  env: string;
  lastUpdated: string;
  devices: readonly DeviceType[];
}

function navigateToView(viewId: string) {
  if (typeof window === 'undefined') return;
  const path = viewId === 'dashboard' ? '/dashboard' : viewId === 'apps' ? '/apps' : `/${viewId}`;
  window.history.pushState({ viewId }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Mock deploy/build log entries per app */
const MOCK_DEPLOY_LOGS: Record<string, { at: string; status: string; message: string }[]> = {
  'app-health': [
    { at: '2024-02-03T14:20:00Z', status: 'succeeded', message: 'Build succeeded. Deployed to production.' },
    { at: '2024-02-01T10:00:00Z', status: 'succeeded', message: 'Build succeeded. Deployed to production.' },
  ],
  'app-symptom-tracker': [
    { at: '2024-02-02T09:00:00Z', status: 'failed', message: 'Build failed: test timeout.' },
    { at: '2024-02-01T18:00:00Z', status: 'succeeded', message: 'Build succeeded. Deployed to production.' },
  ],
  'app-health-coach': [
    { at: '2024-02-02T15:30:00Z', status: 'succeeded', message: 'Build succeeded. Deployed to production.' },
  ],
  'app-ai-planner': [
    { at: '2024-02-02T16:45:00Z', status: 'succeeded', message: 'Build succeeded. Deployed to production.' },
  ],
  'app-habit-tracker': [
    { at: '2024-02-01T18:00:00Z', status: 'succeeded', message: 'Build succeeded. Deployed to production.' },
  ],
};

/** Mock DB tables and sample rows per app */
const MOCK_DB_TABLES: Record<string, { table: string; columns: string[]; rows: Record<string, string>[] }[]> = {
  'app-health': [
    { table: 'users', columns: ['id', 'email', 'name'], rows: [{ id: '1', email: 'alice@example.com', name: 'Alice' }, { id: '2', email: 'bob@example.com', name: 'Bob' }] },
    { table: 'metrics', columns: ['id', 'type', 'value'], rows: [{ id: '1', type: 'steps', value: '5000' }, { id: '2', type: 'heart_rate', value: '72' }] },
  ],
  'app-symptom-tracker': [
    { table: 'users', columns: ['id', 'email'], rows: [{ id: '1', email: 'user@example.com' }] },
    { table: 'entries', columns: ['id', 'symptom', 'severity'], rows: [{ id: '1', symptom: 'headache', severity: '2' }] },
  ],
  'app-health-coach': [
    { table: 'users', columns: ['id', 'email'], rows: [{ id: '1', email: 'coach@example.com' }] },
  ],
  'app-ai-planner': [
    { table: 'users', columns: ['id', 'email'], rows: [] },
    { table: 'tasks', columns: ['id', 'title', 'done'], rows: [{ id: '1', title: 'Review docs', done: 'false' }] },
  ],
  'app-habit-tracker': [
    { table: 'users', columns: ['id', 'email'], rows: [{ id: '1', email: 'habit@example.com' }] },
    { table: 'habits', columns: ['id', 'name', 'streak'], rows: [{ id: '1', name: 'Exercise', streak: '7' }] },
  ],
};

const NO_ACTIVITY_ITEM: ActivityItem = {
  id: 'none',
  actor: '—',
  action: 'app_created',
  target: '—',
  description: 'No activity yet.',
  at: new Date().toISOString(),
};

/** Mock per-app usage: requests and tokens per day (last 7), cost total */
const MOCK_APP_USAGE: Record<string, { requests: number[]; tokens: number[]; cost: string }> = {
  'app-health': { requests: [120, 340, 280, 410, 390, 520, 480], tokens: [8, 22, 18, 28, 25, 35, 32], cost: '$2.84' },
  'app-symptom-tracker': { requests: [80, 95, 110, 88, 102, 115, 98], tokens: [5, 6, 7, 5, 6, 8, 6], cost: '$0.92' },
  'app-health-coach': { requests: [200, 280, 310, 290, 350, 380, 420], tokens: [18, 24, 28, 26, 30, 34, 38], cost: '$4.12' },
  'app-ai-planner': { requests: [150, 180, 220, 190, 240, 260, 210], tokens: [12, 14, 18, 15, 20, 22, 17], cost: '$2.18' },
  'app-habit-tracker': { requests: [60, 72, 68, 85, 78, 90, 82], tokens: [4, 5, 4, 6, 5, 6, 5], cost: '$0.68' },
};

const USAGE_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Simple bar chart for usage (e.g. requests or tokens per day). */
function UsageBarChart({ values, label, ariaLabel }: { values: number[]; label: string; ariaLabel: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="usage-chart" role="img" aria-label={ariaLabel}>
      <p className="usage-chart-label">{label}</p>
      <div className="usage-chart-bars">
        {values.map((v, i) => (
          <div key={i} className="usage-chart-bar-wrap" title={`${USAGE_DAY_LABELS[i]}: ${v}`}>
            <div className="usage-chart-bar" style={{ height: `${(v / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="usage-chart-x">
        {USAGE_DAY_LABELS.map((d, i) => (
          <span key={i} className="usage-chart-x-tick">{d}</span>
        ))}
      </div>
    </div>
  );
}

function normalizeApiApp(api: { id: string; name: string; slug: string }): DisplayApp {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    health: '—',
    status: 'OK',
    env: '—',
    lastUpdated: '—',
    devices: [],
  };
}

function normalizeMockApp(mock: { id: string; name: string; status: string; health: string; env?: string; lastUpdated?: string; devices: readonly DeviceType[] }): DisplayApp {
  return {
    id: mock.id,
    name: mock.name,
    slug: mock.id,
    health: mock.health,
    status: mock.status,
    env: mock.env ?? '—',
    lastUpdated: mock.lastUpdated ?? '—',
    devices: mock.devices ?? [],
  };
}

/**
 * Drill-down page for a single app. Resolves app from path (slug/id) via API or mock.
 * Tabs: Devices, Usage, Activity (with deploy/build logs), Data (DB browser), Advanced (AI placeholder).
 * @returns App drill-down page React element, or loading/not-found state
 */
export default function AppDrillDown() {
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '').split('/')[0] || '' : '';
  const slugOrId = path || '';
  const { getAuthToken } = useAuth();

  const [app, setApp] = useState<DisplayApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [devices, setDevices] = useState<readonly DeviceType[]>([]);
  const [isAccessEditing, setIsAccessEditing] = useState(false);
  const [isAccessLoading, setIsAccessLoading] = useState(false);
  type AppTabId = 'devices' | 'usage' | 'activity' | 'data' | 'advanced';
  const [activeTab, setActiveTab] = useState<AppTabId>('devices');

  const [dbSchema, setDbSchema] = useState<{ tables: { name: string; columns: { name: string; type: string }[] }[] } | null>(null);
  const [dbSchemaError, setDbSchemaError] = useState<string | null>(null);
  const [dbTables, setDbTables] = useState<string[] | null>(null);
  const [dbTableData, setDbTableData] = useState<Record<string, Record<string, unknown>[]>>({});

  /** When true, app was loaded from API (Railway); we fetch real deploy/build logs. */
  const [appFromApi, setAppFromApi] = useState(false);
  /** Timeline of deployments (no log content until expanded). */
  const [apiDeployments, setApiDeployments] = useState<Array<{
    id: string;
    status: string;
    createdAt: string;
    url?: string | null;
  }> | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  /** Which deployment is expanded; log content fetched on demand. */
  const [expandedDeploymentId, setExpandedDeploymentId] = useState<string | null>(null);
  const [deploymentLogsCache, setDeploymentLogsCache] = useState<Record<string, {
    buildLogs: Array<{ timestamp: string; message: string; severity?: string | null }>;
    deploymentLogs: Array<{ timestamp: string; message: string; severity?: string | null }>;
  }>>({});
  const [loadingDeploymentId, setLoadingDeploymentId] = useState<string | null>(null);

  const APP_TABS: { id: AppTabId; label: string }[] = [
    { id: 'devices', label: 'Devices' },
    { id: 'usage', label: 'Usage' },
    { id: 'activity', label: 'Activity' },
    { id: 'data', label: 'Data' },
    { id: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    const mock = getAppById(slugOrId);
    if (mock) {
      setApp(normalizeMockApp(mock));
      setDevices(mock.devices ?? []);
      setAppFromApi(false);
      setApiDeployments(null);
      setLoading(false);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setAppFromApi(false);
    setApiDeployments(null);
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(getAppUrl(slugOrId), { headers })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          setApp(null);
          return;
        }
        if (!res.ok) {
          setApp(null);
          return;
        }
        return res.json();
      })
      .then((data: { app?: { id: string; name: string; slug: string } } | undefined) => {
        if (cancelled || !data?.app) return;
        const normalized = normalizeApiApp(data.app);
        setApp(normalized);
        setDevices(normalized.devices);
        setAppFromApi(true);
        setNotFound(false);
        setActiveTab('activity');
      })
      .catch(() => {
        if (!cancelled) setApp(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slugOrId, getAuthToken]);

  useEffect(() => {
    if (app) setDevices((prev) => (app.devices.length ? app.devices : prev));
  }, [app?.id]);

  const startAccessEdit = () => {
    setIsAccessLoading(true);
    setTimeout(() => {
      setIsAccessLoading(false);
      setIsAccessEditing(true);
    }, 700);
  };

  const toggleDevice = (id: DeviceType) => {
    setDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const fetchDbSchema = useCallback(() => {
    if (!app?.slug) return;
    setDbSchemaError(null);
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(getCrossappCommsSchemaUrl(app.slug), { headers })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          return { ok: true as const, data };
        }
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          // ignore
        }
        return { ok: false as const, message };
      })
      .then((result) => {
        if (result.ok && result.data?.tables) {
          setDbSchema({ tables: result.data.tables });
          setDbSchemaError(null);
        } else if (!result.ok) {
          setDbSchema(null);
          setDbSchemaError(result.message);
        }
      });
  }, [app?.slug, getAuthToken]);

  useEffect(() => {
    if (activeTab === 'data' && app?.slug) fetchDbSchema();
  }, [activeTab, app?.slug, fetchDbSchema]);

  useEffect(() => {
    if (!app?.slug || !dbSchema) return;
    setDbTables(dbSchema.tables.map((t) => t.name));
  }, [app?.slug, dbSchema]);

  const loadTableData = useCallback((table: string) => {
    if (!app?.slug) return;
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(getCrossappCommsTableDataUrl(app.slug, table), { headers })
      .then((res) => res.ok ? res.json() : null)
      .then((data: { rows?: Record<string, unknown>[] } | null) => {
        if (data?.rows) {
          const rows = data.rows;
          setDbTableData((prev) => ({ ...prev, [table]: rows }));
        }
      });
  }, [app?.slug, getAuthToken]);

  useEffect(() => {
    if (activeTab !== 'data' || !dbTables?.length || !app?.slug) return;
    dbTables.forEach((table) => loadTableData(table));
  }, [activeTab, dbTables, app?.slug, loadTableData]);

  useEffect(() => {
    if (!app?.slug || !appFromApi) return;
    let cancelled = false;
    setLogsLoading(true);
    setLogsError(null);
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(getAppLogsUrl(app.slug), { headers })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(res.status === 404 ? 'Not found' : ` ${res.status}`);
        return res.json();
      })
      .then((data: { deployments?: Array<{ id: string; status: string; createdAt: string; url?: string | null }> }) => {
        if (!cancelled) setApiDeployments(data?.deployments ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setLogsError(err instanceof Error ? err.message : 'Failed to load logs');
          setApiDeployments(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => { cancelled = true; };
  }, [app?.slug, appFromApi, getAuthToken]);

  const fetchDeploymentLogs = useCallback((deploymentId: string) => {
    if (!app?.slug || deploymentLogsCache[deploymentId]) return;
    setLoadingDeploymentId(deploymentId);
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(getAppDeploymentLogsUrl(app.slug, deploymentId), { headers })
      .then((res) => res.ok ? res.json() : null)
      .then((data: { buildLogs?: unknown[]; deploymentLogs?: unknown[] } | null) => {
        if (data)
          setDeploymentLogsCache((prev) => ({
            ...prev,
            [deploymentId]: {
              buildLogs: (data.buildLogs ?? []) as Array<{ timestamp: string; message: string; severity?: string | null }>,
              deploymentLogs: (data.deploymentLogs ?? []) as Array<{ timestamp: string; message: string; severity?: string | null }>,
            },
          }));
      })
      .finally(() => setLoadingDeploymentId((id) => (id === deploymentId ? null : id)));
  }, [app?.slug, getAuthToken, deploymentLogsCache]);

  const toggleDeploymentExpand = useCallback((deploymentId: string) => {
    setExpandedDeploymentId((prev) => (prev === deploymentId ? null : deploymentId));
  }, []);

  useEffect(() => {
    if (expandedDeploymentId && app?.slug) fetchDeploymentLogs(expandedDeploymentId);
  }, [expandedDeploymentId, app?.slug, fetchDeploymentLogs]);

  useEffect(() => {
    setExpandedDeploymentId(null);
    setDeploymentLogsCache({});
  }, [app?.slug]);

  if (loading) {
    return (
      <div className="overview-page">
        <div className="app-drill-nav">
          <button type="button" className="overview-back-link" onClick={() => navigateToView('apps')}>
            ← Back to apps
          </button>
        </div>
        <p className="overview-section-desc" style={{ padding: '2rem' }}>Loading app…</p>
      </div>
    );
  }
  if (notFound || !app) {
    return (
      <div className="overview-page">
        <div className="app-drill-nav">
          <button type="button" className="overview-back-link" onClick={() => navigateToView('apps')}>
            ← Back to apps
          </button>
        </div>
        <p className="overview-section-desc" style={{ padding: '2rem' }}>App not found.</p>
      </div>
    );
  }

  const activityItems = getActivityForApp(app.id);
  const activityList = activityItems.length > 0 ? activityItems : [NO_ACTIVITY_ITEM];
  const deployLogs = MOCK_DEPLOY_LOGS[app.id] ?? [];
  const showRailwayLogs = appFromApi;
  const displayTables: { table: string; columns: string[]; rows: Record<string, unknown>[] }[] =
    dbSchema?.tables?.length
      ? dbSchema.tables.map((t) => ({
          table: t.name,
          columns: t.columns.map((c) => c.name),
          rows: dbTableData[t.name] ?? [],
        }))
      : (MOCK_DB_TABLES[app.id] ?? []);

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <div className="app-drill-nav">
          <button type="button" className="overview-back-link" onClick={() => navigateToView('apps')}>
            ← Back to apps
          </button>
        </div>
        <h1 className="overview-hero-title">{app.name}</h1>
      </header>

      {/* Status at top */}
      <section className="app-drill-status-top" aria-labelledby="app-status-heading">
        <h2 id="app-status-heading" className="visually-hidden">Status</h2>
        <div className="overview-metrics-grid overview-metrics-grid--compact app-drill-status-grid">
          <div className="overview-metric-card">
            <span className="overview-metric-label">Health</span>
            <span className={`overview-metric-value overview-metric-value--${app.health === 'Healthy' ? 'ok' : 'warn'}`}>
              {app.health}
            </span>
          </div>
          <div className="overview-metric-card">
            <span className="overview-metric-label">Environment</span>
            <span className="overview-metric-value">{app.env ?? 'Production'}</span>
          </div>
          <div className="overview-metric-card">
            <span className="overview-metric-label">Last updated</span>
            <span className="overview-metric-value">{app.lastUpdated ?? '—'}</span>
          </div>
        </div>
      </section>

      {/* Tabs: Devices | Usage | Activity | Data | Advanced */}
      <div className="app-drill-tabs-wrap" role="tablist" aria-label="App sections">
        {APP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`app-tabpanel-${tab.id}`}
            id={`app-tab-${tab.id}`}
            className={`app-drill-tab ${activeTab === tab.id ? 'app-drill-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="app-drill-tabpanels">
        {activeTab === 'devices' && (
          <div
            id="app-tabpanel-devices"
            role="tabpanel"
            aria-labelledby="app-tab-devices"
            className="app-drill-tabpanel"
          >
            <div className="app-drill-group glance-section" role="group" aria-labelledby="app-glance-heading">
              <h2 id="app-glance-heading" className="app-drill-group-title">
                Device availability
              </h2>
              <p className="overview-section-desc device-availability-desc">
                See which devices this app is available on and manage the device types (Web, iOS, Android, Desktop) you want.
              </p>
              <div className="glance-strip ai-casing">
                <div className="glance-strip-block glance-strip-access" aria-labelledby="app-access-heading">
                  <div className="access-header">
                    <h3 id="app-access-heading" className="glance-strip-title">Manage device types</h3>
                    {!isAccessEditing && !isAccessLoading && (
                      <button
                        type="button"
                        className="account-btn access-edit-btn"
                        onClick={startAccessEdit}
                        aria-expanded="false"
                        aria-controls="access-options"
                      >
                        Edit
                      </button>
                    )}
                    {isAccessEditing && (
                      <button
                        type="button"
                        className="account-btn access-done-btn"
                        onClick={() => setIsAccessEditing(false)}
                        aria-expanded="true"
                        aria-controls="access-options"
                      >
                        Done
                      </button>
                    )}
                  </div>
                  <p className="glance-strip-desc">
                    {isAccessEditing
                      ? 'Select the device types where this app should be available. Use Open to launch or download on each.'
                      : 'Enabled device types are listed below. Click Edit to add or change which types (Web, iOS, Android, Desktop) are available.'}
                  </p>
                  {isAccessLoading && (
                    <div className="access-loading" id="access-options" role="status" aria-live="polite">
                      <span className="access-loading-spinner" aria-hidden="true" />
                      <span className="access-loading-text">Generating…</span>
                    </div>
                  )}
                  {!isAccessLoading && isAccessEditing && (
                    <div id="access-options" className="access-options">
                      <p className="admin-label access-available-label">Requested device types</p>
                      <ul className="account-prefs-list access-device-list" aria-label="Requested device types">
                        {DEVICE_OPTIONS.map((opt) => (
                          <li key={opt.id} className="account-prefs-item">
                            <label className="account-prefs-label">
                              <input
                                type="checkbox"
                                checked={devices.includes(opt.id)}
                                onChange={() => toggleDevice(opt.id)}
                                className="account-prefs-checkbox"
                              />
                              <span>{opt.label}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                      {devices.length > 0 ? (
                        <div className="app-drill-devices">
                          {devices.map((d) => (
                            <button
                              key={d}
                              type="button"
                              className="account-btn glance-device-btn"
                            >
                              {DEVICE_OPTIONS.find((o) => o.id === d)?.label ?? d} — Open
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="glance-strip-empty" aria-live="polite">Select at least one device type above to open this app.</p>
                      )}
                    </div>
                  )}
                  {!isAccessLoading && !isAccessEditing && (
                    <>
                      {devices.length > 0 ? (
                        <>
                          <p className="admin-label access-available-label">Available on</p>
                          <div className="app-drill-devices">
                            {devices.map((d) => (
                              <button
                                key={d}
                                type="button"
                                className="account-btn glance-device-btn"
                              >
                                {DEVICE_OPTIONS.find((o) => o.id === d)?.label ?? d} — Open
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="glance-strip-empty" aria-live="polite">No device types enabled. Click Edit to choose Web, iOS, Android, or Desktop.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div
            id="app-tabpanel-usage"
            role="tabpanel"
            aria-labelledby="app-tab-usage"
            className="app-drill-tabpanel"
          >
            <div className="app-drill-group">
              <h2 className="app-drill-group-title">Usage</h2>
              <p className="overview-section-desc">
                Per-app usage: requests, tokens, cost for this app only.
              </p>
              <div className="ai-casing usage-casing">
                {(() => {
                  const usage = MOCK_APP_USAGE[app.id] ?? MOCK_APP_USAGE['app-health'];
                  return (
                    <>
                      <div className="usage-charts">
                        <UsageBarChart
                          values={usage.requests}
                          label="Requests"
                          ariaLabel={`Requests per day: ${usage.requests.join(', ')}`}
                        />
                        <UsageBarChart
                          values={usage.tokens}
                          label="Tokens (K)"
                          ariaLabel={`Tokens per day in thousands: ${usage.tokens.join(', ')}`}
                        />
                      </div>
                      <div className="usage-cost">
                        <span className="usage-cost-label">Cost this period</span>
                        <span className="usage-cost-value">{usage.cost}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div
            id="app-tabpanel-activity"
            role="tabpanel"
            aria-labelledby="app-tab-activity"
            className="app-drill-tabpanel"
          >
            <div className="app-drill-group activity-logs-group">
              <h2 className="app-drill-group-title">Activity &amp; logs</h2>
              <p className="overview-section-desc activity-logs-desc">
                Recent activity and deployment history for this app.
              </p>
              <div className="activity-logs-grid">
                <section className="activity-logs-card activity-logs-activity" aria-labelledby="app-activity-heading">
                  <h3 id="app-activity-heading" className="activity-logs-card-title">Activity</h3>
                  <p className="activity-logs-card-desc">Who did what and when.</p>
                  <div className="activity-logs-casing">
                    <ul className="activity-feed" role="feed" aria-label="App activity">
                      {activityList.map((a, index) => (
                        <ActivityFeedItem key={a.id} item={a} isLast={index === activityList.length - 1} />
                      ))}
                    </ul>
                  </div>
                </section>
                <section className="activity-logs-card activity-logs-deploy" aria-labelledby="app-deploy-heading">
                  <h3 id="app-deploy-heading" className="activity-logs-card-title">Deploy &amp; build logs</h3>
                  <p className="activity-logs-card-desc">
                    {appFromApi ? 'Timeline of deployments. Click a deployment to load build and runtime logs.' : 'Recent deployments and build status.'}
                  </p>
                  <div className="activity-logs-casing deploy-logs-casing">
                    {logsLoading && <p className="activity-logs-empty">Loading deployments…</p>}
                    {!logsLoading && logsError && (
                      <p className="activity-logs-empty" role="alert">Could not load deployments: {logsError}</p>
                    )}
                    {!logsLoading && showRailwayLogs && apiDeployments && apiDeployments.length > 0 && (
                      <ul className="railway-deployments-timeline" role="list">
                        {apiDeployments.map((d) => {
                          const isExpanded = expandedDeploymentId === d.id;
                          const logs = deploymentLogsCache[d.id];
                          const isLoadingLogs = loadingDeploymentId === d.id;
                          return (
                            <li key={d.id} className="railway-deployment-timeline-item">
                              <div className="deploy-log-row">
                                <span className={`deploy-log-status deploy-log-status--${d.status.toLowerCase()}`}>
                                  {d.status}
                                </span>
                                <time className="deploy-log-date" dateTime={d.createdAt}>
                                  {formatActivityTime(d.createdAt)}
                                </time>
                                {d.url && (
                                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="deploy-log-link">
                                    View in Railway
                                  </a>
                                )}
                                <button
                                  type="button"
                                  className="deploy-log-view-logs-btn"
                                  onClick={() => toggleDeploymentExpand(d.id)}
                                  aria-expanded={isExpanded}
                                  aria-controls={`deployment-logs-${d.id}`}
                                >
                                  {isExpanded ? 'Hide logs' : 'View logs'}
                                </button>
                              </div>
                              {isExpanded && (
                                <div id={`deployment-logs-${d.id}`} className="railway-deployment-logs-detail">
                                  {isLoadingLogs && <p className="railway-log-loading">Loading logs…</p>}
                                  {!isLoadingLogs && logs && (
                                    <>
                                      {logs.buildLogs.length > 0 && (
                                        <div className="railway-log-group">
                                          <h4 className="railway-log-group-title">Build logs</h4>
                                          <pre className="railway-log-pre">
                                            {logs.buildLogs.map((line, i) => (
                                              <span key={i} className="railway-log-line">
                                                {line.timestamp && (
                                                  <span className="railway-log-ts">{line.timestamp} </span>
                                                )}
                                                {line.message}
                                                {'\n'}
                                              </span>
                                            ))}
                                          </pre>
                                        </div>
                                      )}
                                      {logs.deploymentLogs.length > 0 && (
                                        <div className="railway-log-group">
                                          <h4 className="railway-log-group-title">Runtime logs</h4>
                                          <pre className="railway-log-pre">
                                            {logs.deploymentLogs.map((line, i) => (
                                              <span key={i} className="railway-log-line">
                                                {line.timestamp && (
                                                  <span className="railway-log-ts">{line.timestamp} </span>
                                                )}
                                                {line.message}
                                                {'\n'}
                                              </span>
                                            ))}
                                          </pre>
                                        </div>
                                      )}
                                      {logs.buildLogs.length === 0 && logs.deploymentLogs.length === 0 && (
                                        <p className="railway-log-empty">No log lines for this deployment.</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {!logsLoading && !showRailwayLogs && deployLogs.length > 0 && (
                      <ul className="deploy-log-list" role="list">
                        {deployLogs.map((log, i) => (
                          <li key={i} className={`deploy-log-entry deploy-log-entry--${log.status}`}>
                            <div className="deploy-log-row">
                              <span className={`deploy-log-status deploy-log-status--${log.status}`}>
                                {log.status === 'succeeded' ? 'Succeeded' : 'Failed'}
                              </span>
                              <time className="deploy-log-date" dateTime={log.at}>
                                {formatActivityTime(log.at)}
                              </time>
                            </div>
                            <p className="deploy-log-message">{log.message}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!logsLoading && !showRailwayLogs && deployLogs.length === 0 && (
                      <p className="activity-logs-empty">No deploy logs yet.</p>
                    )}
                    {!logsLoading && showRailwayLogs && apiDeployments?.length === 0 && (
                      <p className="activity-logs-empty">No deployments yet for this service.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div
            id="app-tabpanel-data"
            role="tabpanel"
            aria-labelledby="app-tab-data"
            className="app-drill-tabpanel"
          >
            <div className="app-drill-group db-browser-group">
              <h2 className="app-drill-group-title">Data</h2>
              <section className="overview-section" aria-labelledby="app-db-heading">
                <h3 id="app-db-heading" className="db-browser-title">
                  Database browser
                </h3>
                <p className="db-browser-note" role="note">
                  <strong>Please note:</strong> Remote data browsing does not work in local dev. Use the admin panel on your Railway deploy to browse app databases.
                </p>
                <div className="db-browser-casing">
                  {dbSchemaError && (
                    <p className="activity-logs-empty" role="alert" style={{ marginBottom: '1rem' }}>
                      {dbSchemaError}
                    </p>
                  )}
                  {displayTables.length > 0 ? (
                    <div className="db-table-list">
                      {displayTables.map((t) => (
                        <div key={t.table} className="db-table-card">
                          <h4 className="db-table-name">{t.table}</h4>
                          <div className="db-table-wrap">
                            <table className="db-table">
                              <thead>
                                <tr>
                                  {t.columns.map((c) => (
                                    <th key={c}>{c}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {t.rows.length > 0 ? t.rows.map((row, ri) => (
                                  <tr key={ri}>
                                    {t.columns.map((col) => (
                                      <td key={col}>{String(row[col] ?? '—')}</td>
                                    ))}
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={t.columns.length} className="db-table-empty">
                                      No rows
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="db-browser-empty">No tables for this app.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div
            id="app-tabpanel-advanced"
            role="tabpanel"
            aria-labelledby="app-tab-advanced"
            className="app-drill-tabpanel"
          >
            <div className="app-drill-group">
              <h2 className="app-drill-group-title">Advanced</h2>
              <section className="overview-section" aria-labelledby="app-ai-heading">
                <h3 id="app-ai-heading" className="overview-section-title">
                  Modify with AI agent
                </h3>
                <p className="overview-section-desc">
                  Request changes to this app via an AI agent. Changes apply to staging first; accept to promote to production.
                </p>
                <div className="ai-casing">
                  <p className="ai-casing-note">[Placeholder: trigger AI agent to modify app → staging → accept to production]</p>
                  <p className="overview-section-desc" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    If you have issues during this process, contact customer support. There may be charges or fees if you require assistance.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <aside className="app-drill-disclaimer">
        <strong>Support</strong> If you have any issues, contact our customer support. There may be charges or fees if you require assistance.
      </aside>
    </div>
  );
}
