/**
 * AI Builder: landing page for the experience of creating apps (with AI).
 * Reads vertical from URL search (?vertical=...) to filter context for the app being added.
 */

/**
 * Reads ?vertical= from window.location.search (for builder context).
 * @returns Vertical query value or null
 */
function getVerticalFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('vertical');
}

/**
 * Renders AI Builder landing: title, summary, and context section showing vertical from URL or prompt to start from Overview.
 * @returns AI Builder landing React element
 */
export default function AIBuilder() {
  const vertical = getVerticalFromUrl();

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">AI Builder</h1>
        <p className="overview-hero-summary">
          Create new apps with AI. This is the landing page for the AI builder experience.
        </p>
      </header>
      <section className="overview-section" aria-labelledby="ai-builder-context-heading">
        <h2 id="ai-builder-context-heading" className="overview-section-title">
          Context
        </h2>
        {vertical ? (
          <p className="overview-section-desc">
            You are adding an app to the <strong>{vertical}</strong> vertical.
          </p>
        ) : (
          <p className="overview-section-desc">
            No vertical selected. Start from the Overview by clicking “Add app” in a vertical to open the builder for that vertical.
          </p>
        )}
      </section>
    </div>
  );
}
