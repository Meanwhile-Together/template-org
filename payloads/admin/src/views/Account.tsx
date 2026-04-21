/**
 * Account view: plan, contact, password, notification preferences (mock).
 * Wraps the Account component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import AccountComponent from '../components/Account';

/** View definition for Account (id: account). */
export const viewMeta: ViewDefinition = {
  id: 'account',
  label: 'Account',
  icon: '👤',
  needAuthorization: true,
};

/** Default export: Account/settings component. */
export default AccountComponent;
