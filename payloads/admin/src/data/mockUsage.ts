/**
 * Mock usage data for Overview at-a-glance and Usage & Billing.
 * No API; UI-only for demo.
 */

/** At-a-glance usage summary: requests, tokens, cost, and period label. */
export interface OverviewUsage {
  requests: number;
  tokens: number;
  cost: string;
  period: string;
}

/** Project-level usage for the current period (e.g. this month). */
export const MOCK_OVERVIEW_USAGE: OverviewUsage = {
  requests: 12_400,
  tokens: 89_000,
  cost: '$12.40',
  period: 'This month',
};

/** App/hosting usage for at-a-glance "App usage" block. */
export const MOCK_APP_USAGE = {
  deployments: 8,
  activeApps: 5,
  period: 'This month',
};

/** AI usage for at-a-glance "AI usage" block. */
export const MOCK_AI_USAGE = {
  requests: 12_400,
  tokens: 89_000,
  cost: '$12.40',
  period: 'This month',
};
