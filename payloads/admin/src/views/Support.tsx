/**
 * Help/Support view: account manager (tier), FAQ, customer support.
 * Wraps the Support component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import SupportComponent from '../components/Support';

/** View definition for Help (id: support). */
export const viewMeta: ViewDefinition = {
  id: 'support',
  label: 'Help',
  icon: '❓',
  needAuthorization: true,
};

/** Default export: Help/Support component. */
export default SupportComponent;
