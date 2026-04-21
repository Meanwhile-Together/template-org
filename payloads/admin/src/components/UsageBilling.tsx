/**
 * Mock: Usage & cost visibility. This panel helps users understand their costs (usage, totals, breakdown).
 * Actual billing (invoices, payment method, plan change) happens on the Project B portal.
 */
/**
 * Renders Usage & Billing page: portal CTA, project total, usage over time, per-app breakdown, limits. Mock.
 * @returns Usage & Billing page React element
 */
export default function UsageBilling() {
  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Usage &amp; Billing</h1>
        <p className="overview-hero-summary">
          Understand your usage and costs here. Invoices, payment method, and plan changes are on the Project B portal.
        </p>
      </header>

      {/* Portal CTA */}
      <section className="overview-section" aria-labelledby="usage-portal-heading">
        <h2 id="usage-portal-heading" className="overview-section-title">
          Manage billing on the portal
        </h2>
        <p className="overview-section-desc">
          View invoices, update payment method, or change your plan on the Project B portal.
        </p>
        <div className="ai-casing">
          <button type="button" className="usage-portal-btn">
            Go to Project B portal
          </button>
        </div>
      </section>

      {/* Project total */}
      <section className="overview-section overview-section--metrics" aria-labelledby="usage-total-heading">
        <h2 id="usage-total-heading" className="overview-section-title">
          Project total
        </h2>
        <p className="overview-section-desc">
          Aggregate usage and cost across the project.
        </p>
        <div className="overview-metrics-grid">
          <div className="overview-metric-card">
            <span className="overview-metric-label">Requests</span>
            <span className="overview-metric-value">—</span>
          </div>
          <div className="overview-metric-card">
            <span className="overview-metric-label">Tokens</span>
            <span className="overview-metric-value">—</span>
          </div>
          <div className="overview-metric-card">
            <span className="overview-metric-label">Cost</span>
            <span className="overview-metric-value">—</span>
          </div>
        </div>
      </section>

      {/* Usage over time */}
      <section className="overview-section" aria-labelledby="usage-over-time-heading">
        <h2 id="usage-over-time-heading" className="overview-section-title">
          Usage over time
        </h2>
        <div className="ai-casing">
          <p className="ai-casing-note">[Placeholder: chart]</p>
        </div>
      </section>

      {/* Per-app breakdown */}
      <section className="overview-section" aria-labelledby="usage-breakdown-heading">
        <h2 id="usage-breakdown-heading" className="overview-section-title">
          Per-app breakdown
        </h2>
        <p className="overview-section-desc">
          Usage and cost by app.
        </p>
        <div className="ai-casing">
          <ul className="ai-behavior-list">
            <li className="ai-behavior-item">
              <div className="ai-behavior-head">
                <strong className="ai-behavior-name">App A</strong>
              </div>
              <div className="ai-behavior-meta">—</div>
            </li>
            <li className="ai-behavior-item">
              <div className="ai-behavior-head">
                <strong className="ai-behavior-name">App B</strong>
              </div>
              <div className="ai-behavior-meta">—</div>
            </li>
          </ul>
        </div>
      </section>

      {/* Thresholds / limits */}
      <section className="overview-section" aria-labelledby="usage-limits-heading">
        <h2 id="usage-limits-heading" className="overview-section-title">
          Thresholds / limits
        </h2>
        <p className="overview-section-desc">
          Quota and limit status.
        </p>
        <div className="ai-casing">
          <p className="ai-casing-note">[Placeholder: limits hit]</p>
        </div>
      </section>
    </div>
  );
}
