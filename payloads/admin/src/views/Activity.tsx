/**
 * Activity view: full project activity log (reached via "View all activity" from Overview). Not in nav.
 * Wraps the Activity component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import ActivityComponent from '../components/Activity';

/** View definition for Activity (id: activity, showInNav: false). */
export const viewMeta: ViewDefinition = {
  id: 'activity',
  label: 'Activity',
  icon: '📋',
  needAuthorization: true,
  showInNav: false, // reachable via "View all activity" from Overview only
};

/** Default export: Full activity log component. */
export default ActivityComponent;
