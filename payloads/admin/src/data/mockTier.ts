/**
 * Mock tier for admin panel. Read from URL ?tier=entry|pro|enterprise (default: entry).
 * No API or auth; UI-only for tier-aware mock experience.
 */
/** Mock plan tier read from URL ?tier= (entry | pro | enterprise). */
export type MockTier = 'entry' | 'pro' | 'enterprise';

const TIER_PARAM = 'tier';
const DEFAULT_TIER: MockTier = 'entry';

const VALID_TIERS: MockTier[] = ['entry', 'pro', 'enterprise'];

function parseTierFromSearch(search: string): MockTier {
  if (typeof search !== 'string') return DEFAULT_TIER;
  const params = new URLSearchParams(search);
  const raw = params.get(TIER_PARAM)?.toLowerCase();
  if (raw && VALID_TIERS.includes(raw as MockTier)) return raw as MockTier;
  return DEFAULT_TIER;
}

/**
 * Returns the current mock tier from window.location.search (?tier=entry|pro|enterprise).
 * Defaults to 'entry' when not in browser or param missing/invalid.
 *
 * @returns MockTier — 'entry' | 'pro' | 'enterprise'
 */
export function getMockTier(): MockTier {
  if (typeof window === 'undefined') return DEFAULT_TIER;
  return parseTierFromSearch(window.location.search);
}

/**
 * Returns true when tier is Pro or Enterprise (full control / account manager path).
 *
 * @param tier - Current mock tier
 * @returns true if tier is 'pro' or 'enterprise'
 */
export function isProOrEnterprise(tier: MockTier): boolean {
  return tier === 'pro' || tier === 'enterprise';
}
