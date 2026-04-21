/**
 * Shared activity feed item (timeline dot + line + content).
 * Used on Overview (recent activity) and Activity page (all activity).
 */
import { formatActivityTime } from '../data/mockActivity';
import type { ActivityItem, ActivityAction } from '../data/mockActivity';

/**
 * Map activity action type to a short label and CSS modifier for the feed indicator.
 * @param action - ActivityAction from ActivityItem
 * @returns { label, modifier } — display label and class suffix (e.g. 'deploy', 'create')
 */
export function getActivityFeedStyle(action: ActivityAction): { label: string; modifier: string } {
  switch (action) {
    case 'app_created':
      return { label: 'Created', modifier: 'create' };
    case 'app_deployed':
      return { label: 'Deployed', modifier: 'deploy' };
    case 'user_invited':
      return { label: 'Invite', modifier: 'invite' };
    case 'user_removed':
      return { label: 'Removed', modifier: 'remove' };
    case 'config_updated':
      return { label: 'Config', modifier: 'config' };
    case 'build_succeeded':
      return { label: 'Build', modifier: 'success' };
    case 'build_failed':
      return { label: 'Build', modifier: 'fail' };
    default:
      return { label: 'Event', modifier: 'default' };
  }
}

/**
 * Single activity feed item: timeline dot, optional line, description, and relative time.
 * @param props - Component props
 * @param props.item - ActivityItem to display
 * @param props.isLast - Whether this is the last item (no line below)
 * @returns List item React element
 */
export default function ActivityFeedItem({
  item,
  isLast,
}: {
  item: ActivityItem;
  isLast: boolean;
}) {
  const { modifier } = getActivityFeedStyle(item.action);
  return (
    <li className="overview-activity-feed-item" role="article">
      <div className="overview-activity-feed-indicator">
        <span className={`overview-activity-feed-dot overview-activity-feed-dot--${modifier}`} aria-hidden />
        {!isLast && <span className="overview-activity-feed-line" aria-hidden />}
      </div>
      <div className="overview-activity-feed-content">
        <p className="overview-activity-feed-desc">{item.description}</p>
        <span className="overview-activity-feed-meta">{formatActivityTime(item.at)}</span>
      </div>
    </li>
  );
}
