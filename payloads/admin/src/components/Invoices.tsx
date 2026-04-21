/**
 * Mock: Invoices live on the Project B portal. This page directs users there.
 * This admin panel is for understanding costs; billing (invoices, payment) happens on the portal.
 */

function navigateToView(viewId: string) {
  if (typeof window === 'undefined') return;
  const path = viewId === 'usage-billing' ? '/usage-billing' : `/${viewId}`;
  window.history.pushState({ viewId }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Renders Invoices page: back link to Usage & Billing, CTA to Project B portal. Mock.
 * @returns Invoices page React element
 */
export default function Invoices() {
  return (
    <div className="mock-page">
      <div style={{ marginBottom: '1rem' }}>
        <button type="button" className="mock-btn mock-btn-small" onClick={() => navigateToView('usage-billing')}>
          ← Back to Usage &amp; cost
        </button>
      </div>
      <h1 className="mock-h1">Invoices</h1>
      <p className="mock-p">
        Invoices and payment are managed on the Project B portal. Use the admin panel to understand your usage and costs; go to the portal to view invoices, update payment, or change plan.
      </p>
      <section className="mock-section">
        <button type="button" className="mock-btn mock-btn-small">
          Go to Project B portal
        </button>
      </section>
    </div>
  );
}
