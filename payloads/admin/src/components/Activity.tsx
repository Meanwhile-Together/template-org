/**
 * Mock: Full activity log page (reached via "View all activity" from Overview).
 * Uses same feed + casing styles as Overview recent activity.
 */
import { getAllActivity } from '../data/mockActivity';
import ActivityFeedItem from './ActivityFeedItem';

function navigateToView(viewId: string) {
  if (typeof window === 'undefined') return;
  const path = viewId === 'dashboard' ? '/dashboard' : `/${viewId}`;
  window.history.pushState({ viewId }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Full activity log page. Renders all mock activity items; back link goes to Overview.
 * @returns Activity page React element
 */
export default function Activity() {
  const items = getAllActivity();

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <button type="button" className="overview-back-link" onClick={() => navigateToView('dashboard')}>
          ← Back to Overview
        </button>
        <h1 className="overview-hero-title">Activity</h1>
        <p className="overview-hero-summary">
          All project activity. For recent activity only, see the Overview.
        </p>
      </header>

      <section className="overview-section overview-section--activity" aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="overview-section-title">
          All activity
        </h2>
        <div className="overview-activity-casing">
          <ul className="overview-activity-feed" role="feed" aria-label="All activity">
            {items.map((a, index) => (
              <ActivityFeedItem key={a.id} item={a} isLast={index === items.length - 1} />
            ))}
          </ul>
          <div className="overview-activity-casing-footer">
            <button
              type="button"
              className="overview-activity-casing-action"
              onClick={() => navigateToView('dashboard')}
            >
              Back to Overview
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
