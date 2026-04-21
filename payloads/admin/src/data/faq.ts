/**
 * FAQ entries for the Help page. Topic is used for grouping; id for accordion.
 */
/** Ordered list of FAQ topics for grouping on the Help page. */
export const FAQ_TOPIC_ORDER = ['Apps', 'Overview & activity', 'Billing', 'AI', 'Account', 'General'] as const;

/** FAQ topic key; one of FAQ_TOPIC_ORDER. */
export type FaqTopic = (typeof FAQ_TOPIC_ORDER)[number];

/** Single FAQ item: id for accordion, topic for grouping, q (question) and a (answer). */
export interface FaqEntry {
  id: string;
  topic: FaqTopic;
  q: string;
  a: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  { id: 'create-app', topic: 'Apps', q: 'How do I create an app?', a: 'Go to Apps in the sidebar, then click "Create app" (or "Manage all" from the Overview). Choose a name and vertical, then your app is created. Open it from the list to configure settings, API keys, and usage.' },
  { id: 'overview-show', topic: 'Overview & activity', q: 'What does the Overview show?', a: 'The Overview is your project dashboard: at-a-glance metrics (requests, tokens, cost), your apps grouped by vertical, and recent activity. Use it to check health and jump into any app.' },
  { id: 'usage-billed', topic: 'Billing', q: 'How is usage billed?', a: 'See Usage & Billing for your project totals (requests, tokens, cost) and per-app breakdown. Invoices, payment method, and plan changes are managed on the Project B portal.' },
  { id: 'api-keys', topic: 'AI', q: 'Where do I add my API keys?', a: 'In the AI section, open "Connect your AI accounts" and add keys per provider (OpenAI, Anthropic, Google, etc.). For app-specific AI, open that app from Overview or Apps and configure it there.' },
  { id: 'default-behaviors', topic: 'AI', q: 'What are default AI behaviors?', a: 'Default behaviors are project-level chatbots (e.g. Customer Support Bot) used when an app doesn\'t specify one. Configure them in the AI section; each has a provider, model, system prompt, temperature, and max tokens.' },
  { id: 'plan-invoice', topic: 'Billing', q: 'How do I change my plan or pay an invoice?', a: 'Plans and billing are managed on the Project B portal. From Account you can see your current plan and use "Go to Project B portal" for invoices, payment method, and plan changes.' },
  { id: 'activity-who', topic: 'Overview & activity', q: 'Where do I see activity and who did what?', a: 'On the Overview you see the last 10 project events; click "View all activity" for the full log. Each entry shows who did what and when (deploys, config changes, user invites, etc.).' },
  { id: 'download-devices', topic: 'Apps', q: 'How do I download or open my app on different devices?', a: 'Open the app from Overview or Apps. On the app page you\'ll see links or actions for Web, iOS, Android, and Desktop depending on how the app is deployed.' },
  { id: 'agents', topic: 'AI', q: 'What are agents?', a: 'Agents run autonomously and can switch between AI behaviors to perform predefined tasks. They use the same AI stack (providers and behaviors) you set in the AI section. Open the "Agents" section there to manage them (advanced).' },
  { id: 'invite-users', topic: 'Account', q: 'How do I invite someone or manage users?', a: 'Go to Users in the sidebar (if your plan includes it). There you can invite people and manage access. Activity will show when users are invited or removed.' },
  { id: 'email-prefs', topic: 'Account', q: 'Where do I change my email or notification preferences?', a: 'Go to Account. You can update your contact email, change your password, and choose notification preferences (billing alerts, deployment and build notifications).' },
  { id: 'contact-help', topic: 'General', q: 'I need more help. Who do I contact?', a: 'Use "Contact support" below to email our team. We typically respond within 1–2 business days. Pro and Enterprise customers can also contact their account manager from the section above.' },
];

/**
 * Filter FAQ entries by query (question or answer) and group by topic in FAQ_TOPIC_ORDER.
 * @param entries - Full list of FAQ entries
 * @param query - Search string (trimmed, case-insensitive); empty string returns all entries
 * @returns Map from FaqTopic to array of matching FaqEntry (only topics with matches are present)
 */
export function filterAndGroupFaq(
  entries: FaqEntry[],
  query: string
): Map<FaqTopic, FaqEntry[]> {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? entries.filter((e) => e.q.toLowerCase().includes(q) || e.a.toLowerCase().includes(q))
    : entries;
  const map = new Map<FaqTopic, FaqEntry[]>();
  for (const topic of FAQ_TOPIC_ORDER) {
    const inTopic = filtered.filter((e) => e.topic === topic);
    if (inTopic.length) map.set(topic, inTopic);
  }
  return map;
}
