/**
 * App drill-down views: generated from app data (template).
 * One component (AppDrillDown) serves all app pages; view definitions come from mockApps.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import { VERTICALS } from './mockApps';

/** Optional icon per app id for sidebar. Defaults to 📦 if missing. */
const APP_ICONS: Record<string, string> = {
  'app-health': '❤️',
  'app-symptom-tracker': '📋',
  'app-health-coach': '🤖',
  'app-ai-planner': '📅',
  'app-habit-tracker': '✓',
};

/** All apps flattened from verticals (order preserved). */
function getAllApps(): { id: string; name: string }[] {
  const list: { id: string; name: string }[] = [];
  for (const v of VERTICALS) {
    for (const app of v.apps) {
      list.push({ id: app.id, name: app.name });
    }
  }
  return list;
}

/**
 * View definitions for each app drill-down page.
 * Used by getViews() so the sidebar shows one nav item per app; getViewComponent(id) returns AppDrillDown for any app id.
 *
 * @returns ViewDefinition[] — one entry per app from mock verticals (id, label, icon, parentId: 'apps', needAuthorization: true)
 */
export function getAppViewDefinitions(): ViewDefinition[] {
  return getAllApps().map((app) => ({
    id: app.id,
    label: app.name,
    icon: APP_ICONS[app.id] ?? '📦',
    parentId: 'apps',
    needAuthorization: true,
  }));
}
