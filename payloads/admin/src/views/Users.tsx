/**
 * Users view: list and manage users/access (mock). Tier-gated on entry.
 * Wraps the Users component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import UsersComponent from '../components/Users';

/** View definition for Users (id: users). */
export const viewMeta: ViewDefinition = {
  id: 'users',
  label: 'Users',
  icon: '👤',
  needAuthorization: true,
};

/** Default export: Users & access component. */
export default UsersComponent;
