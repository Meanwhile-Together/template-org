/**
 * Apps view: bootstrap payload roster from `/api/config` (see `components/Apps.tsx`).
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import AppsComponent from '../components/Apps';

/** View definition for Apps (id: apps). */
export const viewMeta: ViewDefinition = {
  id: 'apps',
  label: 'Apps',
  icon: '📦',
  needAuthorization: true,
};

/** Default export: Apps list and create component. */
export default AppsComponent;
