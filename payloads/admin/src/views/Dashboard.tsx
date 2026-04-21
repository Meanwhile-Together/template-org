/**
 * Dashboard (Overview) view: at-a-glance metrics, your apps, recent activity.
 * Wraps the Dashboard component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import DashboardComponent from '../components/Dashboard';

/** View definition for Overview (id: dashboard). */
export const viewMeta: ViewDefinition = {
  id: 'dashboard',
  label: 'Overview',
  icon: '📊',
  needAuthorization: true,
  order: 0,
};

/** Default export: Overview/Dashboard component. */
export default DashboardComponent;
