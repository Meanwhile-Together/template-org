/**
 * Consolidated Account Settings page.
 *
 * Scope (admin-panel-launch-plan, Workstream 1): one route renders three sections —
 * Profile, Billing, and AI Usage. Apps and Users have their own top-level pages
 * (Workstreams 1a / 1b) and are not sections here.
 *
 * Everything here is still mock-backed (see data/mockUsage + mockTier). Real
 * wiring lands in Workstreams 3 (Stripe) and 4 (AI usage tracking).
 */
import { useEffect, useState } from 'react';
import { getMockTier } from '../data/mockTier';
import { MOCK_OVERVIEW_USAGE, MOCK_AI_USAGE } from '../data/mockUsage';
import { adminUrl } from '../data/adminApi';

interface UsageSummary {
  period: { start: string | null; end: string | null; label?: string | null };
  totals: { requests: number; tokens: number; costCents: number };
  perApp: Array<{ appId: string; appName?: string; requests: number; tokens: number; costCents: number }>;
  limits?: { tokens?: number | null; softWarnPct?: number | null };
  stub?: boolean;
}

const MOCK_PLAN_NAMES: Record<string, string> = {
  entry: 'Entry',
  pro: 'Professional',
  enterprise: 'Enterprise',
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Opens a Stripe Customer Portal session via /api/internal/billing/portal-session. Mock until wired. */
async function openBillingPortal(): Promise<void> {
  try {
    const res = await fetch('/api/internal/billing/portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
  } catch {
    // fall through
  }
  alert('Billing portal is not configured yet. Set STRIPE_SECRET_KEY + STRIPE_BILLING_PORTAL_RETURN_URL.');
}

export default function Account() {
  const tier = getMockTier();
  const planName = MOCK_PLAN_NAMES[tier] ?? 'Entry';

  const [displayName, setDisplayName] = useState('You');
  const [email, setEmail] = useState('you@example.com');
  const [notifyBilling, setNotifyBilling] = useState(true);
  const [notifyDeploys, setNotifyDeploys] = useState(true);
  const [notifyOutages, setNotifyOutages] = useState(true);

  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setUsageLoading(true);
    fetch(adminUrl('/usage/tokens'), {
      headers: (() => {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('backend_auth_token') : null;
        const h: Record<string, string> = {};
        if (token) h.Authorization = `Bearer ${token}`;
        return h;
      })(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled) setUsage(data); })
      .catch(() => { if (!cancelled) setUsage(null); })
      .finally(() => { if (!cancelled) setUsageLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const effectiveTotals = usage && !usage.stub
    ? {
        requests: usage.totals.requests,
        tokens: usage.totals.tokens,
        cost: `$${(usage.totals.costCents / 100).toFixed(2)}`,
      }
    : {
        requests: MOCK_AI_USAGE.requests,
        tokens: MOCK_AI_USAGE.tokens,
        cost: MOCK_AI_USAGE.cost,
      };

  const perAppRows = usage && !usage.stub && usage.perApp.length > 0
    ? usage.perApp
    : null;

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Account</h1>
        <p className="overview-hero-summary">
          Everything tied to your account — profile, billing, and AI usage. Apps and users have their own pages.
        </p>
      </header>

      {/* ===== PROFILE ===== */}
      <section className="overview-section" aria-labelledby="account-profile-heading">
        <h2 id="account-profile-heading" className="overview-section-title">
          Profile
        </h2>
        <p className="overview-section-desc">
          Your display name, login email, and password.
        </p>
        <div className="ai-casing">
          <div className="account-field">
            <label htmlFor="account-name" className="admin-label">Display name</label>
            <input
              id="account-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="admin-input"
              style={{ maxWidth: '20rem' }}
            />
          </div>
          <div className="account-field">
            <label htmlFor="account-email" className="admin-label">Email</label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              style={{ maxWidth: '20rem' }}
            />
          </div>
          <button type="button" className="account-btn">
            Save profile
          </button>
        </div>

        <div className="ai-casing" style={{ marginTop: '1rem' }}>
          <h3 className="overview-section-title" style={{ fontSize: '1rem' }}>Password</h3>
          <p className="overview-section-desc">
            Change your password, or trigger an email-based reset.
          </p>
          <div className="help-button-row">
            <button type="button" className="account-btn">Change password</button>
            <button type="button" className="account-btn">Email me a reset link</button>
          </div>
        </div>

        <div className="ai-casing" style={{ marginTop: '1rem' }}>
          <h3 className="overview-section-title" style={{ fontSize: '1rem' }}>Notifications</h3>
          <p className="overview-section-desc">
            Choose which emails you receive.
          </p>
          <ul className="account-prefs-list">
            <li className="account-prefs-item">
              <label className="account-prefs-label">
                <input
                  type="checkbox"
                  checked={notifyBilling}
                  onChange={(e) => setNotifyBilling(e.target.checked)}
                  className="account-prefs-checkbox"
                />
                <span>Billing and usage alerts</span>
              </label>
            </li>
            <li className="account-prefs-item">
              <label className="account-prefs-label">
                <input
                  type="checkbox"
                  checked={notifyDeploys}
                  onChange={(e) => setNotifyDeploys(e.target.checked)}
                  className="account-prefs-checkbox"
                />
                <span>Deployment and build notifications</span>
              </label>
            </li>
            <li className="account-prefs-item">
              <label className="account-prefs-label">
                <input
                  type="checkbox"
                  checked={notifyOutages}
                  onChange={(e) => setNotifyOutages(e.target.checked)}
                  className="account-prefs-checkbox"
                />
                <span>Service-down alerts (outage pings)</span>
              </label>
            </li>
          </ul>
          <button type="button" className="account-btn">Save preferences</button>
        </div>
      </section>

      {/* ===== BILLING ===== */}
      <section className="overview-section" aria-labelledby="account-billing-heading">
        <h2 id="account-billing-heading" className="overview-section-title">
          Billing
        </h2>
        <p className="overview-section-desc">
          Your plan, payment method, and invoices. Payments are managed through Stripe.
        </p>

        <div className="ai-casing">
          <p className="account-plan-value">
            Current plan: <strong>{planName}</strong>
          </p>
          <div className="help-button-row">
            <button type="button" className="usage-portal-btn" onClick={() => void openBillingPortal()}>
              Open billing portal
            </button>
            <button type="button" className="account-btn" onClick={() => void openBillingPortal()}>
              Update payment method
            </button>
            <button type="button" className="account-btn" onClick={() => void openBillingPortal()}>
              View invoices
            </button>
          </div>
        </div>

        <div className="ai-casing" style={{ marginTop: '1rem' }}>
          <h3 className="overview-section-title" style={{ fontSize: '1rem' }}>Period summary</h3>
          <div className="overview-metrics-grid">
            <div className="overview-metric-card">
              <span className="overview-metric-label">Requests ({MOCK_OVERVIEW_USAGE.period})</span>
              <span className="overview-metric-value">{formatCompact(MOCK_OVERVIEW_USAGE.requests)}</span>
            </div>
            <div className="overview-metric-card">
              <span className="overview-metric-label">Tokens</span>
              <span className="overview-metric-value">{formatCompact(MOCK_OVERVIEW_USAGE.tokens)}</span>
            </div>
            <div className="overview-metric-card">
              <span className="overview-metric-label">Estimated cost</span>
              <span className="overview-metric-value">{MOCK_OVERVIEW_USAGE.cost}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI USAGE ===== */}
      <section className="overview-section" aria-labelledby="account-ai-usage-heading">
        <h2 id="account-ai-usage-heading" className="overview-section-title">
          AI usage
        </h2>
        <p className="overview-section-desc">
          Token consumption this period, per app, and against your plan limits.
          We monitor because we pay for tokens on your behalf.
        </p>

        <div className="ai-casing">
          <div className="overview-metrics-grid">
            <div className="overview-metric-card">
              <span className="overview-metric-label">AI requests</span>
              <span className="overview-metric-value">
                {usageLoading ? '…' : formatCompact(effectiveTotals.requests)}
              </span>
            </div>
            <div className="overview-metric-card">
              <span className="overview-metric-label">Tokens used</span>
              <span className="overview-metric-value">
                {usageLoading ? '…' : formatCompact(effectiveTotals.tokens)}
              </span>
            </div>
            <div className="overview-metric-card">
              <span className="overview-metric-label">AI cost</span>
              <span className="overview-metric-value">
                {usageLoading ? '…' : effectiveTotals.cost}
              </span>
            </div>
          </div>
          {usage?.stub && (
            <p className="overview-section-desc" style={{ marginTop: '0.5rem' }}>
              No live usage yet — figures shown are mock values. They will go live once the host wires an <code>AIUsageTracker</code>.
            </p>
          )}
        </div>

        <div className="ai-casing" style={{ marginTop: '1rem' }}>
          <h3 className="overview-section-title" style={{ fontSize: '1rem' }}>Per-app breakdown</h3>
          {!perAppRows ? (
            <>
              <p className="overview-section-desc">
                Per-app AI usage appears here once apps start consuming tokens.
              </p>
              <ul className="ai-behavior-list">
                <li className="ai-behavior-item">
                  <div className="ai-behavior-head">
                    <strong className="ai-behavior-name">No apps with usage yet</strong>
                  </div>
                  <div className="ai-behavior-meta">—</div>
                </li>
              </ul>
            </>
          ) : (
            <ul className="ai-behavior-list">
              {perAppRows.map((row) => (
                <li key={row.appId} className="ai-behavior-item">
                  <div className="ai-behavior-head">
                    <strong className="ai-behavior-name">{row.appName ?? row.appId}</strong>
                  </div>
                  <div className="ai-behavior-meta">
                    {formatCompact(row.tokens)} tokens · ${(row.costCents / 100).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ai-casing" style={{ marginTop: '1rem' }}>
          <h3 className="overview-section-title" style={{ fontSize: '1rem' }}>Thresholds &amp; overage</h3>
          {usage?.limits?.tokens ? (
            <p className="overview-section-desc">
              Plan limit for <strong>{planName}</strong>:{' '}
              <strong>{formatCompact(usage.limits.tokens)}</strong> tokens / period.
              {typeof usage.limits.softWarnPct === 'number' && (
                <> Soft warning at <strong>{usage.limits.softWarnPct}%</strong> of limit.</>
              )}
            </p>
          ) : (
            <p className="overview-section-desc">
              Plan limit for <strong>{planName}</strong>: no live threshold yet. Overage behaviour is configured at the platform level.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
