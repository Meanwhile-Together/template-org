/**
 * Homepage / overview: At a glance → your apps (from API) → recent activity.
 * First-run banner (dismissible, localStorage) when not yet dismissed.
 */
import { useAdminApps } from '../contexts/AdminAppsContext';
import type { AdminAppFromApi } from '../contexts/AdminAppsContext';
import { getRecentActivity } from '../data/mockActivity';
import { MOCK_OVERVIEW_USAGE, MOCK_APP_USAGE, MOCK_AI_USAGE } from '../data/mockUsage';
import FirstRunBanner from './FirstRunBanner';
import ActivityFeedItem from './ActivityFeedItem';

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function navigateToView(viewId: string) {
  if (typeof window === 'undefined') return;
  const path = viewId === 'dashboard' ? '/dashboard' : viewId === 'apps' ? '/apps' : `/${viewId}`;
  window.history.pushState({ viewId }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Card for one app in the Overview "Your apps" list; opens app on click. */
function DashboardAppCard({ app }: { app: AdminAppFromApi }) {
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

/**
 * Overview/Dashboard: at-a-glance metrics, your apps (from API), recent activity, first-run banner.
 * @returns Overview page React element
 */
export default function Dashboard() {
  const { apps, loading: appsLoading } = useAdminApps();
  const recent = getRecentActivity(10);
  const totalApps = apps.length;

  return (
    <div className="overview-page">
      <FirstRunBanner />

      {/* Hero: title + one-line summary */}
      <header className="overview-hero">
        <h1 className="overview-hero-title">Overview</h1>
        <p className="overview-hero-summary">
          Project-level summary: usage, apps by vertical, and recent activity.
        </p>
      </header>

      {/* At a glance: own section with Health, App usage, AI usage */}
      <section className="overview-section overview-section--glance" aria-labelledby="overview-glance-heading">
        <div className="overview-section-header">
          <h2 id="overview-glance-heading" className="overview-section-title">
            At a glance
          </h2>
          <button
            type="button"
            className="overview-section-action"
            onClick={() => navigateToView('usage-billing')}
            aria-label={`Usage ${MOCK_OVERVIEW_USAGE.period}. Open Usage & Billing`}
          >
            {MOCK_OVERVIEW_USAGE.period}
          </button>
        </div>
        <div className="overview-glance-blocks">
          <div className="overview-glance-block" aria-labelledby="glance-health-heading">
            <h3 id="glance-health-heading" className="overview-glance-block-title">Health</h3>
            <div className="overview-glance-metrics" role="list">
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Apps</span>
                <span className="overview-glance-metric-value">{appsLoading ? '…' : totalApps}</span>
              </div>
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Status</span>
                <span className="overview-glance-metric-value overview-glance-metric-value--ok">
                  {appsLoading ? '…' : 'OK'}
                </span>
              </div>
            </div>
          </div>
          <div className="overview-glance-block" aria-labelledby="glance-app-usage-heading">
            <h3 id="glance-app-usage-heading" className="overview-glance-block-title">App usage</h3>
            <div className="overview-glance-metrics" role="list">
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Deployments</span>
                <span className="overview-glance-metric-value">{formatCompact(MOCK_APP_USAGE.deployments)}</span>
              </div>
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Active apps</span>
                <span className="overview-glance-metric-value">{MOCK_APP_USAGE.activeApps}</span>
              </div>
            </div>
          </div>
          <div className="overview-glance-block" aria-labelledby="glance-ai-usage-heading">
            <h3 id="glance-ai-usage-heading" className="overview-glance-block-title">AI usage</h3>
            <div className="overview-glance-metrics" role="list">
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Requests</span>
                <span className="overview-glance-metric-value">{formatCompact(MOCK_AI_USAGE.requests)}</span>
              </div>
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Tokens</span>
                <span className="overview-glance-metric-value">{formatCompact(MOCK_AI_USAGE.tokens)}</span>
              </div>
              <div className="overview-glance-metric" role="listitem">
                <span className="overview-glance-metric-label">Cost</span>
                <span className="overview-glance-metric-value">{MOCK_AI_USAGE.cost}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your apps: from API */}
      <section className="overview-section overview-section--apps" aria-labelledby="overview-apps-heading">
        <div className="overview-section-header">
          <h2 id="overview-apps-heading" className="overview-section-title">
            Your apps
          </h2>
          <button
            type="button"
            className="overview-section-action"
            onClick={() => navigateToView('apps')}
          >
            Manage all →
          </button>
        </div>
        <p className="overview-section-desc">
          Open any app to configure or view usage.
        </p>
        {appsLoading && <p className="overview-section-desc" style={{ padding: '0.5rem 0' }}>Loading apps…</p>}
        {!appsLoading && (
          <div className="overview-verticals">
            <ul className="overview-app-grid">
              {apps.length === 0 ? (
                <p className="overview-section-desc">No apps yet. Go to Apps to create one.</p>
              ) : (
                apps.map((app) => <DashboardAppCard key={app.id} app={app} />)
              )}
            </ul>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="overview-section overview-section--activity" aria-labelledby="overview-activity-heading">
        <h2 id="overview-activity-heading" className="overview-section-title">
          Recent activity
        </h2>
        <p className="overview-section-desc">
          Last 10 project events across all apps.
        </p>
        <div className="overview-activity-casing">
          <ul className="overview-activity-feed" role="feed" aria-label="Recent activity">
            {recent.map((a, index) => (
              <ActivityFeedItem key={a.id} item={a} isLast={index === recent.length - 1} />
            ))}
          </ul>
          <div className="overview-activity-casing-footer">
            <button
              type="button"
              className="overview-activity-casing-action"
              onClick={() => navigateToView('activity')}
            >
              View all activity →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
