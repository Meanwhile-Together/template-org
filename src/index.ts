import type { ComponentType } from "react";

type UnknownRecord = Record<string, unknown>;

export type PayloadView = {
  id: string;
  label: string;
  component: ComponentType<UnknownRecord>;
};

const NotConfigured: ComponentType<UnknownRecord> = () => null;

/**
 * Basic starter exports expected by the project-bridge payload loader.
 * Replace these with real view modules as your payload grows.
 */
export const payloadBasicViews: PayloadView[] = [
  {
    id: "home",
    label: "Home",
    component: NotConfigured,
  },
];

export function getAppViews(): PayloadView[] {
  return payloadBasicViews;
}

export function getViewComponent(viewId: string): ComponentType<UnknownRecord> | null {
  const match = payloadBasicViews.find((view) => view.id === viewId);
  return match ? match.component : null;
}

export function getAppRoutes(): UnknownRecord[] {
  return [];
}
