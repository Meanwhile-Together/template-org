/**
 * Landing view: unauthenticated entry page with hero, feature cards, and sign-in/register CTAs.
 * View id: 'landing'. Hide when authenticated (redirect to dashboard).
 */
import type { ViewDefinition } from '@meanwhile-together/shared';

/** View definition for the Landing page (id: landing, hideWhenAuthenticated: dashboard). */
export const viewMeta: ViewDefinition = {
  id: 'landing',
  label: 'Landing',
  icon: '🏠',
  needAuthorization: false,
  hideWhenAuthenticated: 'dashboard',
  order: -1,
  showInNav: true,
};

const sectionStyle = { marginBottom: '2rem' };
const cardStyle = {
  padding: '1.25rem',
  borderRadius: 12,
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-secondary)',
  marginBottom: '1rem',
};
const btnBase = {
  padding: '0.75rem 1.5rem',
  borderRadius: 8,
  cursor: 'pointer' as const,
  fontWeight: 600,
  fontSize: '1rem',
};

/** Props for the Landing view component. */
interface LandingProps {
  /** Optional callback when user clicks Log in */
  onLogin?: () => void;
  /** Optional callback when user clicks Create account */
  onRegister?: () => void;
}

/**
 * Landing page: hero, feature cards, and sign-in/register buttons.
 * @param props - LandingProps
 * @param props.onLogin - Optional handler for Log in
 * @param props.onRegister - Optional handler for Create account
 * @returns Landing page React element
 */
export default function Landing({ onLogin, onRegister }: LandingProps) {
  return (
    <div className="overview-page" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <header className="overview-hero" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="overview-hero-title" style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>
          Admin panel for your new custom AI-driven app
        </h1>
        <p className="overview-hero-summary" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
          On your own cloud. Build, deploy, and manage everything in one place.
        </p>
      </header>

      <section className="overview-section" style={sectionStyle} aria-labelledby="landing-features-heading">
        <h2 id="landing-features-heading" className="visually-hidden">
          What you get
        </h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Custom AI-driven
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your app, powered by AI. Configure models, chat, and agents from this panel.
            </p>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>☁️</div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              On your own cloud
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Deploy to your infrastructure. Your data, your control, your cloud.
            </p>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📦</div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              One place to manage
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Apps, usage, billing, and settings. Sign in to open your dashboard.
            </p>
          </div>
        </div>
      </section>

      <section
        className="overview-section"
        aria-labelledby="landing-cta-heading"
        style={{ textAlign: 'center', marginTop: '2rem' }}
      >
        <h2 id="landing-cta-heading" className="visually-hidden">
          Sign in or create an account
        </h2>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Sign in to access your admin dashboard.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {onLogin && (
            <button
              type="button"
              onClick={onLogin}
              style={{
                ...btnBase,
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              Log in
            </button>
          )}
          {onRegister && (
            <button
              type="button"
              onClick={onRegister}
              style={{
                ...btnBase,
                border: 'none',
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
              }}
            >
              Create account
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
