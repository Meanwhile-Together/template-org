/**
 * Usage & Billing view: portal CTA, project total, usage over time, per-app breakdown (mock).
 * Wraps the UsageBilling component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import UsageBillingComponent from '../components/UsageBilling';

/** View definition for Usage & Billing (id: usage-billing). */
export const viewMeta: ViewDefinition = {
  id: 'usage-billing',
  label: 'Usage & Billing',
  icon: '📊',
  needAuthorization: true,
};

/** Default export: Usage & Billing component. */
export default UsageBillingComponent;
