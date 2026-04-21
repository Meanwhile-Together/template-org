/**
 * Shared mock app data for Dashboard and Apps pages.
 */

/** Device/platform the app can be accessed on. Default for new apps: none selected. */
export type DeviceType = 'web' | 'ios' | 'android' | 'desktop';

/** Options for device type checkboxes (Web, iOS, Android, Desktop). */
export const DEVICE_OPTIONS: { id: DeviceType; label: string }[] = [
  { id: 'web', label: 'Web' },
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
  { id: 'desktop', label: 'Desktop' },
];

export type AppItem = {
  id: string;
  name: string;
  status: string;
  health: string;
  /** Vertical name for display on card */
  vertical?: string;
  /** Environment for display */
  env?: string;
  /** Last updated / deployed for display */
  lastUpdated?: string;
  /** Devices/platforms this app is available on. User must select; default for new apps is none. */
  devices: readonly DeviceType[];
};

/** Mock verticals (e.g. Wellness, Productivity) each with a list of apps. */
export const VERTICALS: { name: string; apps: readonly AppItem[] }[] = [
  {
    name: 'Wellness',
    apps: [
      { id: 'app-health', name: 'Health app', status: 'OK', health: 'Healthy', vertical: 'Wellness', env: 'Production', lastUpdated: '2 days ago', devices: ['web', 'ios'] },
      { id: 'app-symptom-tracker', name: 'Symptom tracker', status: 'OK', health: 'Healthy', vertical: 'Wellness', env: 'Production', lastUpdated: '1 day ago', devices: ['web'] },
      { id: 'app-health-coach', name: 'Health coach', status: 'OK', health: 'Healthy', vertical: 'Wellness', env: 'Production', lastUpdated: '3 days ago', devices: ['web', 'ios', 'android', 'desktop'] },
    ],
  },
  {
    name: 'Productivity',
    apps: [
      { id: 'app-ai-planner', name: 'AI planner', status: 'OK', health: 'Healthy', vertical: 'Productivity', env: 'Production', lastUpdated: '5 days ago', devices: ['web', 'desktop'] },
      { id: 'app-habit-tracker', name: 'Habit tracker', status: 'OK', health: 'Healthy', vertical: 'Productivity', env: 'Production', lastUpdated: '1 day ago', devices: ['web', 'ios', 'android'] },
    ],
  },
];

/**
 * Looks up an app by id in the mock verticals.
 * @param id - App id (e.g. 'app-health')
 * @returns AppItem if found, undefined otherwise
 */
export function getAppById(id: string): AppItem | undefined {
  for (const v of VERTICALS) {
    const app = v.apps.find((a) => a.id === id);
    if (app) return app;
  }
  return undefined;
}
