/**
 * Mock activity log data for Overview, Activity page, and per-app drill-down.
 */

/** Kind of activity event (app lifecycle, user, config, build). */
export type ActivityAction =
  | 'app_created'
  | 'app_deployed'
  | 'user_invited'
  | 'user_removed'
  | 'config_updated'
  | 'build_succeeded'
  | 'build_failed';

export interface ActivityItem {
  id: string;
  actor: string;
  action: ActivityAction;
  target: string;
  /** Human-readable description, e.g. "Alice created app Health app" */
  description: string;
  /** ISO timestamp */
  at: string;
  /** Optional app id when event is scoped to an app */
  appId?: string;
}

/** Project-level activity (all apps). Last 10 for Overview; full list for Activity page. */
export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', actor: 'Alice', action: 'app_deployed', target: 'Health app', description: 'Alice deployed Health app', at: '2024-02-03T14:20:00Z', appId: 'app-health' },
  { id: '2', actor: 'Bob', action: 'user_invited', target: 'charlie@example.com', description: 'Bob invited charlie@example.com', at: '2024-02-03T13:15:00Z' },
  { id: '3', actor: 'Alice', action: 'app_created', target: 'Symptom tracker', description: 'Alice created app Symptom tracker', at: '2024-02-03T11:00:00Z', appId: 'app-symptom-tracker' },
  { id: '4', actor: 'Bob', action: 'config_updated', target: 'AI planner', description: 'Bob updated config for AI planner', at: '2024-02-02T16:45:00Z', appId: 'app-ai-planner' },
  { id: '5', actor: 'Alice', action: 'build_succeeded', target: 'Health coach', description: 'Build succeeded for Health coach', at: '2024-02-02T15:30:00Z', appId: 'app-health-coach' },
  { id: '6', actor: 'Bob', action: 'user_removed', target: 'old@example.com', description: 'Bob removed user old@example.com', at: '2024-02-02T12:00:00Z' },
  { id: '7', actor: 'Alice', action: 'app_deployed', target: 'Habit tracker', description: 'Alice deployed Habit tracker', at: '2024-02-01T18:00:00Z', appId: 'app-habit-tracker' },
  { id: '8', actor: 'Bob', action: 'app_created', target: 'Habit tracker', description: 'Bob created app Habit tracker', at: '2024-02-01T17:30:00Z', appId: 'app-habit-tracker' },
  { id: '9', actor: 'Alice', action: 'build_failed', target: 'Symptom tracker', description: 'Build failed for Symptom tracker', at: '2024-02-01T10:00:00Z', appId: 'app-symptom-tracker' },
  { id: '10', actor: 'Bob', action: 'config_updated', target: 'Health app', description: 'Bob updated config for Health app', at: '2024-01-31T14:00:00Z', appId: 'app-health' },
  { id: '11', actor: 'Alice', action: 'user_invited', target: 'bob@example.com', description: 'Alice invited bob@example.com', at: '2024-01-31T09:00:00Z' },
];

/**
 * Returns the most recent activity items (first N from mock list).
 * @param limit - Max number of items (default 10)
 * @returns Array of ActivityItem
 */
export function getRecentActivity(limit: number = 10): ActivityItem[] {
  return MOCK_ACTIVITY.slice(0, limit);
}

/**
 * Returns all mock activity items.
 * @returns Copy of full MOCK_ACTIVITY array
 */
export function getAllActivity(): ActivityItem[] {
  return [...MOCK_ACTIVITY];
}

/**
 * Returns activity items scoped to a single app (appId match).
 * @param appId - App id to filter by
 * @returns Array of ActivityItem for that app
 */
export function getActivityForApp(appId: string): ActivityItem[] {
  return MOCK_ACTIVITY.filter((a) => a.appId === appId);
}

/**
 * Formats an ISO timestamp as relative time (e.g. "5m ago", "2h ago", "3d ago") or locale date if older.
 * @param iso - ISO 8601 timestamp string
 * @returns Human-readable relative or absolute time string
 */
export function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
