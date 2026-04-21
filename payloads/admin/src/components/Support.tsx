/**
 * Mock: Help / Support section. How we help the user: FAQ, customer support.
 * When tier is Pro/Enterprise, show "Contact your account manager" (mock — empty button).
 */
import { useState } from 'react';
import { isProOrEnterprise, getMockTier } from '../data/mockTier';
import { FAQ_ENTRIES, filterAndGroupFaq } from '../data/faq';

/**
 * Renders Help page: optional account manager section (tier), FAQ (search + accordion), customer support. Mock.
 * @returns Support/Help page React element
 */
export default function Support() {
  const tier = getMockTier();
  const showAccountManager = isProOrEnterprise(tier);
  const [faqQuery, setFaqQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const faqGroups = filterAndGroupFaq(FAQ_ENTRIES, faqQuery);

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Help</h1>
        <p className="overview-hero-summary">
          Browse the FAQ or reach our team. Pro and Enterprise customers can contact their account manager.
        </p>
      </header>

      {showAccountManager && (
        <section className="overview-section" aria-labelledby="help-account-manager-heading">
          <h2 id="help-account-manager-heading" className="overview-section-title">
            Contact your account manager
          </h2>
          <p className="overview-section-desc">
            Pro and Enterprise customers have a dedicated account manager for custom features, billing, and technical questions. (Mock — buttons do nothing.)
          </p>
          <div className="ai-casing">
            <div className="help-button-row">
              <button type="button" className="account-btn">
                Email your account manager
              </button>
              <button type="button" className="account-btn">
                Schedule a call
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="overview-section" aria-labelledby="help-faq-heading">
        <h2 id="help-faq-heading" className="overview-section-title">
          FAQ
        </h2>
        <p className="overview-section-desc">
          Frequently asked questions and answers. Browse by topic for billing, deployments, apps, and more.
        </p>
        <div className="ai-casing">
          <label htmlFor="help-faq-search" className="admin-label">
            Search FAQ
          </label>
          <input
            id="help-faq-search"
            type="search"
            placeholder="Type to filter by question or answer…"
            value={faqQuery}
            onChange={(e) => setFaqQuery(e.target.value)}
            className="help-faq-search admin-input"
            aria-describedby="help-faq-desc"
          />
          <p id="help-faq-desc" className="overview-section-desc" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            Browse by topic below or search to narrow results.
          </p>
          {faqGroups.size === 0 ? (
            <p className="help-faq-empty">No questions match your search. Try different keywords.</p>
          ) : (
            <div className="help-faq-accordion">
              {Array.from(faqGroups.entries()).map(([topic, entries]) => (
                <div key={topic} className="help-faq-group">
                  <h3 className="help-faq-topic">{topic}</h3>
                  <ul className="help-faq-list" aria-label={`${topic} questions`}>
                    {entries.map((entry) => {
                      const isOpen = openFaqId === entry.id;
                      const panelId = `help-faq-answer-${entry.id}`;
                      const triggerId = `help-faq-question-${entry.id}`;
                      return (
                        <li key={entry.id} className="help-faq-item help-faq-item--accordion">
                          <button
                            type="button"
                            id={triggerId}
                            className="help-faq-trigger"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpenFaqId(isOpen ? null : entry.id)}
                          >
                            <span className="help-faq-trigger-text">{entry.q}</span>
                            <span className="help-faq-chevron" aria-hidden>{isOpen ? '▼' : '▶'}</span>
                          </button>
                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            className="help-faq-panel"
                            hidden={!isOpen}
                          >
                            <p className="help-faq-answer">{entry.a}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="overview-section" aria-labelledby="help-support-heading">
        <h2 id="help-support-heading" className="overview-section-title">
          Customer support
        </h2>
        <p className="overview-section-desc">
          Need help from our team? Reach out for technical support, billing questions, or anything else.
        </p>
        <div className="ai-casing">
          <ul className="help-support-list">
            <li>Email: support@projectbridge.com</li>
            <li>Response time: within 1–2 business days</li>
          </ul>
          <button type="button" className="account-btn" style={{ marginTop: '0.75rem' }}>
            Contact support
          </button>
        </div>
      </section>
    </div>
  );
}
