/**
 * Applications — list from API (GET /api/internal/admin/apps). Open navigates to app drill-down.
 */
import { useState } from 'react';
import { useAdminApps } from '../contexts/AdminAppsContext';
import type { AdminAppFromApi } from '../contexts/AdminAppsContext';
import { DEVICE_OPTIONS } from '../data/mockApps';
import type { DeviceType } from '../data/mockApps';
import { getMockTier } from '../data/mockTier';

function navigateToView(viewId: string) {
  if (typeof window === 'undefined') return;
  const path = viewId === 'dashboard' ? '/dashboard' : viewId === 'apps' ? '/apps' : `/${viewId}`;
  window.history.pushState({ viewId }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Card for one app in the Apps list; opens app drill-down on click. */
function AppCard({ app }: { app: AdminAppFromApi }) {
  return (
    <li className="overview-app-card">
      <div className="overview-app-card-head">
        <strong className="overview-app-card-name">{app.name}</strong>
      </div>
      <div className="overview-app-card-meta">
        <span>Slug: {app.slug}</span>
      </div>
      <button type="button" className="overview-app-card-btn" onClick={() => navigateToView(app.id)}>
        Open
      </button>
    </li>
  );
}

const MOCK_ENTRY_APP_LIMIT = 5;
const MOCK_ENTRY_APP_COUNT = 3;

/**
 * Apps list from API, "Create app" modal (device selection), and tier-gated Advanced settings section.
 * @returns Apps page React element
 */
export default function Apps() {
  const { apps, loading, error } = useAdminApps();
  const tier = getMockTier();
  const isEntry = tier === 'entry';
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAppDevices, setCreateAppDevices] = useState<DeviceType[]>([]);

  const toggleCreateDevice = (id: DeviceType) => {
    setCreateAppDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Apps</h1>
        <p className="overview-hero-summary">
          Create and manage your apps. Open any app to configure settings, usage, and deployments.
        </p>
      </header>

      <section className="overview-section overview-section--apps" aria-labelledby="apps-list-heading">
        <div className="overview-section-header">
          <h2 id="apps-list-heading" className="overview-section-title">
            Your apps
          </h2>
          <button
            type="button"
            className="usage-portal-btn"
            onClick={() => {
              setShowCreateModal(true);
              setCreateAppDevices([]);
            }}
          >
            + Create app
          </button>
        </div>
        {isEntry && (
          <p className="overview-section-desc">
            You have {MOCK_ENTRY_APP_COUNT} of {MOCK_ENTRY_APP_LIMIT} apps. (Mock)
          </p>
        )}
        <p className="overview-section-desc">
          Open an app to configure it or view per-app usage.
        </p>
        {loading && <p className="overview-section-desc" style={{ padding: '1rem 0' }}>Loading apps…</p>}
        {error && <p className="overview-section-desc" style={{ padding: '1rem 0', color: 'var(--color-error, #c00)' }}>{error}</p>}
        {!loading && !error && (
          <div className="overview-verticals">
            <ul className="overview-app-grid">
              {apps.length === 0 ? (
                <p className="overview-section-desc">No apps yet. Create one to get started.</p>
              ) : (
                apps.map((app) => <AppCard key={app.id} app={app} />)
              )}
            </ul>
          </div>
        )}
      </section>

      {!isEntry && (
        <section className="overview-section ai-collapsible-section" aria-labelledby="apps-advanced-heading">
          <button
            type="button"
            className="ai-collapsible-heading"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            id="apps-advanced-heading"
          >
            <span className="ai-collapsible-chevron" aria-hidden>{advancedOpen ? '▼' : '▶'}</span>
            Advanced settings
          </button>
          {advancedOpen && (
            <div className="ai-collapsible-body">
              <p className="overview-section-desc">
                Per-app or project-level options: enable/disable, API keys, environment, limits, per-app usage.
              </p>
              <ul className="ai-agent-bullets">
                <li>Enable / disable apps</li>
                <li>API keys, secrets</li>
                <li>Environment (prod / dev / staging)</li>
                <li>Limits and quotas</li>
                <li>Per-app usage</li>
              </ul>
            </div>
          )}
        </section>
      )}

      {showCreateModal && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-app-title"
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 id="create-app-title">Create app</h2>
            </div>
            <div className="admin-modal-body">
              <p>
                Which devices do you need this app on? Select at least one. You can change this later in the app settings.
              </p>
              <div className="apps-create-devices">
                {DEVICE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`apps-create-device-option ${createAppDevices.includes(opt.id) ? 'apps-create-device-option--selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={createAppDevices.includes(opt.id)}
                      onChange={() => toggleCreateDevice(opt.id)}
                      className="account-prefs-checkbox"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <p className="overview-section-desc" style={{ marginTop: '1rem', marginBottom: 0 }}>
                Cost may vary based on which devices you enable.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="account-btn" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="usage-portal-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
