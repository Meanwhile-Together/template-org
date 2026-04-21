/**
 * Admin views – same discovery as application (shared resolveViewModules); glob stays here (Vite).
 * getViews() merges app drill-down definitions (mock or API); getStaticViewDefinitions() has no app children.
 * useViews() / useGetViewComponent() use API apps when inside AdminAppsProvider.
 *
 * When you add or remove a view file, the backend Vite config plugin (admin-views-reload) triggers a
 * full reload so the glob is re-evaluated. If the new view still doesn’t show, do a hard refresh (Ctrl+Shift+R).
 */

import type { ViewDefinition } from '@meanwhile-together/shared';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { resolveViewModules, DEFAULT_IGNORE_FILES } from '@meanwhile-together/shared';
import { getAppViewDefinitions } from '../data/appViews';
import { getAppById } from '../data/mockApps';
import { getMockTier } from '../data/mockTier';
import { useAdminApps } from '../contexts/AdminAppsContext';
import AppDrillDown from '../components/AppDrillDown';

const ENTRY_HIDDEN_NAV_IDS = new Set<string>(['users', 'invoices']);

interface ViewModule {
  viewMeta?: ViewDefinition;
  default?: React.ComponentType<{ theme?: 'light' | 'dark'; bridge?: unknown }>;
}

const viewModules: Record<string, ViewModule> = import.meta.glob<ViewModule>(
  './**/*.tsx',
  { eager: true }
);

const resolvedViews = resolveViewModules<React.ComponentType<{ theme?: 'light' | 'dark'; bridge?: unknown }>>(
  viewModules,
  { ignoreFiles: DEFAULT_IGNORE_FILES }
);

const viewById = new Map(resolvedViews.map((v) => [v.viewMeta.id, v]));

const LANDING_VIEW_ID = 'landing';

/** Ensure all views except Landing require login. */
function ensureLoginRequiredExceptLanding(list: ViewDefinition[]): ViewDefinition[] {
  return list.map((v) =>
    v.id === LANDING_VIEW_ID ? v : { ...v, needAuthorization: true }
  );
}

function applyTierAndOrder(list: ViewDefinition[]): ViewDefinition[] {
  const withAuth = ensureLoginRequiredExceptLanding(list);
  const tier = getMockTier();
  const isEntry = tier === 'entry';
  let filtered = isEntry ? withAuth.filter((v) => !ENTRY_HIDDEN_NAV_IDS.has(v.id)) : withAuth;
  const topLevel = filtered.filter((v) => (v as ViewDefinition & { parentId?: string }).parentId == null);
  const children = filtered.filter((v) => (v as ViewDefinition & { parentId?: string }).parentId != null);
  const sectionParentIds = new Set(children.map((c) => (c as ViewDefinition & { parentId?: string }).parentId).filter(Boolean));
  const restTop = topLevel.filter((v) => !sectionParentIds.has(v.id));
  const sectionParents = topLevel.filter((v) => sectionParentIds.has(v.id));
  const byOrder = (a: ViewDefinition, b: ViewDefinition) => (a.order ?? 999) - (b.order ?? 999);
  restTop.sort(byOrder);
  sectionParents.sort(byOrder);
  children.sort(byOrder);
  return [...restTop, ...sectionParents, ...children];
}

/**
 * Static view definitions only (no app drill-down children). Used with useViews() when merging API apps.
 *
 * @returns ViewDefinition[] — resolved view metas with auth/tier/order applied, no app children
 */
export function getStaticViewDefinitions(): ViewDefinition[] {
  const list = resolvedViews.map((v) => v.viewMeta);
  return applyTierAndOrder(list);
}

/** View definitions for API apps (parentId: 'apps'). */
function appViewDefsFromApps(apps: { id: string; name: string }[]): ViewDefinition[] {
  return apps.map((app) => ({
    id: app.id,
    label: app.name,
    icon: '📦',
    parentId: 'apps',
    needAuthorization: true,
  }));
}

/**
 * All view definitions: static views plus app drill-down from mock (getAppViewDefinitions). Use when not inside AdminAppsProvider.
 *
 * @returns ViewDefinition[] — static + mock app views with auth/tier/order applied
 */
export function getViews(): ViewDefinition[] {
  const list = [
    ...resolvedViews.map((v) => v.viewMeta),
    ...getAppViewDefinitions(),
  ];
  return applyTierAndOrder(list);
}

/**
 * Resolves the React component for a view id. Returns AppDrillDown for mock app ids, else the static view component.
 *
 * @param id - View id (e.g. 'dashboard', 'apps', or app id like 'app-health')
 * @returns Component for the view or undefined if not found
 */
export function getViewComponent(
  id: string
): React.ComponentType<{ theme?: 'light' | 'dark'; bridge?: unknown }> | undefined {
  if (getAppById(id)) return AppDrillDown;
  return viewById.get(id)?.default;
}

/**
 * Reactive view list: static views + app children from API. Use inside AdminAppsProvider.
 *
 * @returns ViewDefinition[] — static definitions plus one nav item per API app (parentId: 'apps')
 */
export function useViews(): ViewDefinition[] {
  const { apps } = useAdminApps();
  return useMemo(() => {
    const staticDefs = getStaticViewDefinitions();
    const appDefs = appViewDefsFromApps(apps);
    return applyTierAndOrder([...staticDefs, ...appDefs]);
  }, [apps]);
}

/**
 * Reactive getViewComponent: static resolution + AppDrillDown for API app ids. Use inside AdminAppsProvider.
 *
 * @returns Function (id) => component or undefined — resolves static views and API app ids to AppDrillDown
 */
export function useGetViewComponent(): (id: string) => React.ComponentType<{ theme?: 'light' | 'dark'; bridge?: unknown }> | undefined {
  const { apps } = useAdminApps();
  return useCallback(
    (id: string) => {
      const staticComponent = viewById.get(id)?.default ?? (getAppById(id) ? AppDrillDown : undefined);
      if (staticComponent) return staticComponent;
      const fromApi = apps.some((a) => a.id === id || a.slug === id);
      return fromApi ? AppDrillDown : undefined;
    },
    [apps]
  );
}
