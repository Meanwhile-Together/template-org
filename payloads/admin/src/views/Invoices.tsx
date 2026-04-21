/**
 * Invoices view: redirects to Project B portal for invoices and payment (mock).
 * Wraps the Invoices component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import InvoicesComponent from '../components/Invoices';

/** View definition for Invoices (id: invoices). */
export const viewMeta: ViewDefinition = {
  id: 'invoices',
  label: 'Invoices',
  icon: '📄',
  needAuthorization: true,
};

/** Default export: Invoices/portal CTA component. */
export default InvoicesComponent;
