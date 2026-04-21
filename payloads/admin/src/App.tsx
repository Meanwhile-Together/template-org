/**
 * Admin payload app: uses local adminPayload + engine Layout (Ascension).
 * Fetches AI config from unified server (backend mode) and passes bridge to Layout.
 */
import React, { useEffect, useState } from 'react';
import { createAppEntry } from '@meanwhile-together/engine';
import { BridgeFactory } from '@meanwhile-together/engine';
import type { BridgeImpl } from '@meanwhile-together/shared';
import type { AppEntryProps } from '@meanwhile-together/engine';
import { FrameworkSplash, Header, Sidebar, getSidebarPushStyle, Auth } from '@meanwhile-together/ui';
import { adminPayload, AdminAppsProvider, useViews, useGetViewComponent, NotificationsBell } from './index';
import { Layout } from '@meanwhile-together/engine';

const BackendHeader: React.FC<React.ComponentProps<typeof Header>> = (props) => (
  <Header {...props} rightActions={<NotificationsBell />} />
);

const BackendApp: React.FC<AppEntryProps> = (props) => (
  <Layout
    getViews={adminPayload.getViews}
    getViewComponent={adminPayload.getViewComponent}
    useViews={useViews}
    useGetViewComponent={useGetViewComponent}
    initialViewId={adminPayload.initialViewId}
    promptSignInWhenBlocked={adminPayload.promptSignInWhenBlocked}
    bridge={props.bridge}
    layoutSlots={{ Header: BackendHeader, Sidebar, Auth, getSidebarPushStyle } as unknown as import('@meanwhile-together/engine').LayoutSlots}
  />
);

const AppEntry = createAppEntry({
  ViewBasedApp: BackendApp,
  FallbackApp: FrameworkSplash,
  getViews: adminPayload.getViews,
});

const AppWithBridge: React.FC = () => {
  const [bridge, setBridge] = useState<BridgeImpl | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/internal/ai/config?platform=web')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.config) {
          setBridge(BridgeFactory.createBridge('web', { ai: data.config }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading…
      </div>
    );
  }

  return (
    <AdminAppsProvider>
      <AppEntry bridge={bridge ?? undefined} />
    </AdminAppsProvider>
  );
};

export default AppWithBridge;
