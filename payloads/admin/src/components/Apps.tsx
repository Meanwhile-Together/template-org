/**
 * Apps — the **tenant** view of payloads installed in this org's host. Source of truth is the
 * bootstrap `/api/config` response (`ClientSafeConfig.payloads`), i.e. whatever is listed
 * under `config/server.json` `apps[]` for the running unified server.
 *
 * Before the 2026-04-21 Apps/Clients split, the `apps` view in the admin panel rendered the
 * signed-in master user's Railway project inventory. That leaked platform-level chrome into
 * every org and silently blanked out for non-master tenants. The Railway-backed UI moved to
 * the master-only `Clients` view; this file now owns the tenant-facing surface. See
 * rule-of-law §1 "Apps/Clients split (bootstrap vs Railway)".
 *
 * No CRUD: bootstrap payloads are defined at the server level (vendored via
 * `MTX/lib/vendor-payloads-from-config.sh` from `config/server.json`). Creating / disabling
 * is a platform operation, not a tenant action — we render "Add a payload via `mtx payload
 * install`" guidance instead of faking a form.
 */
import { useAppConfig } from '@meanwhile-together/shared';
import type { ClientPayloadIdentity } from '@meanwhile-together/shared';

/** Human-readable mount description: `"/" + slug` for root; mountBase for non-root. */
function describeMount(payload: ClientPayloadIdentity): string {
  if (!payload.mountBase) return '/ (default host)';
  return payload.mountBase;
}

/** Absolute href the user can click to open this payload. Never '' — falls back to '/'. */
function hrefFor(payload: ClientPayloadIdentity): string {
  const base = payload.mountBase?.trim() ?? '';
  if (!base) return '/';
  // mountBase is already a leading-slash, no-trailing-slash path (see ClientPayloadIdentity
  // contract) — append a trailing slash so the link resolves to the payload's index, not
  // to a sibling like `/vibe-check.html`.
  return `${base}/`;
}

function PayloadCard({ payload }: { payload: ClientPayloadIdentity }) {
  const mount = describeMount(payload);
  return (
    <li className="overview-app-card">
      <div className="overview-app-card-head">
        <strong className="overview-app-card-name">{payload.name}</strong>
      </div>
      <div className="overview-app-card-meta" style={{ display: 'grid', gap: '0.1rem' }}>
        <span>Slug: <code>{payload.slug}</code></span>
        <span>Mount: <code>{mount}</code></span>
        <span>API: <code>{payload.apiPrefix}</code></span>
        {payload.description && (
          <span style={{ color: 'var(--text-secondary, #555)' }}>{payload.description}</span>
        )}
      </div>
      <div className="overview-app-card-actions">
        <button
          type="button"
          className="overview-app-card-btn overview-app-card-btn--secondary"
        >
          Config
        </button>
        <a
          className="overview-app-card-btn"
          href={hrefFor(payload)}
          // Full document navigation — each payload is its own SPA at `mountBase`. Client-side
          // navigation would stay inside the admin mount and 404; this is a hard hop to the URL.
        >
          Open
        </a>
      </div>
    </li>
  );
}

/**
 * Apps page — renders the tenant's bootstrap payload roster.
 * @returns React element
 */
export default function Apps() {
  const { payloads, loading } = useAppConfig();

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Apps</h1>
        <p className="overview-hero-summary">
          Payloads installed in this org's host. Each one is its own app mounted at a URL
          prefix; Open goes to that URL. Config is reserved for in-admin settings (not wired yet).
        </p>
      </header>

      <section className="overview-section overview-section--apps" aria-labelledby="apps-list-heading">
        <div className="overview-section-header">
          <h2 id="apps-list-heading" className="overview-section-title">
            Installed payloads
          </h2>
        </div>
        <p className="overview-section-desc">
          This list is delivered with the SPA bootstrap (`/api/config` →
          `ClientSafeConfig.payloads`) — it mirrors <code>config/server.json</code> on the
          running unified server. Adding or removing a payload is a platform operation; run
          <code> mtx payload install &lt;name&gt;</code> and redeploy.
        </p>
        {loading && (
          <p className="overview-section-desc" style={{ padding: '1rem 0' }}>Loading…</p>
        )}
        {!loading && (
          <div className="overview-verticals">
            <ul className="overview-app-grid">
              {payloads.length === 0 ? (
                <p className="overview-section-desc">
                  No payloads are registered on this host. That's valid for a bare backend,
                  but the admin panel itself should always appear here — if you see this in a
                  hybrid-admin deploy something is wrong upstream. Check the server's
                  bootstrap log for <code>[PayloadRegistry]</code> entries.
                </p>
              ) : (
                payloads.map((p) => <PayloadCard key={p.id} payload={p} />)
              )}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
