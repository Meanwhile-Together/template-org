/**
 * AI Builder view: landing for creating apps with AI; reads ?vertical= from URL.
 * Not shown in nav (showInNav: false). Wraps the AIBuilder component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import AIBuilderComponent from '../components/AIBuilder';

/** View definition for AI Builder (id: ai-builder, showInNav: false). */
export const viewMeta: ViewDefinition & { showInNav?: boolean } = {
  id: 'ai-builder',
  label: 'AI Builder',
  icon: '✨',
  needAuthorization: true,
  showInNav: false,
};

/** Default export: AI Builder landing component. */
export default AIBuilderComponent;
