/**
 * AI view: default behaviors, connect providers, agents (mock).
 * Wraps the AI component from components.
 */
import type { ViewDefinition } from '@meanwhile-together/shared';
import AIComponent from '../components/AI';

/** View definition for AI (id: ai). */
export const viewMeta: ViewDefinition = {
  id: 'ai',
  label: 'AI',
  icon: '🤖',
  needAuthorization: true,
};

/** Default export: AI control center component. */
export default AIComponent;
