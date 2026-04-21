/**
 * AI Chat view: chat UI from @meanwhile-together/ui. Not shown in nav (showInNav: false).
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import { AIChat } from '@meanwhile-together/ui';

/** View definition for AI Chat (id: ai-chat, showInNav: false). */
export const viewMeta: ViewDefinition & { showInNav?: boolean } = {
  id: 'ai-chat',
  label: 'AI Chat',
  icon: '💬',
  needAuthorization: true,
  showInNav: false,
};

/** Default export: AIChat component from ui package. */
export { AIChat as default };
