/**
 * Mock: Account / Profile template page. Plan, email, password, notification prefs.
 * All buttons (Save, Change password) are empty — no submit, no API.
 */
import { useState } from 'react';
import { getMockTier } from '../data/mockTier';

const MOCK_PLAN_NAMES: Record<string, string> = {
  entry: 'Entry',
  pro: 'Professional',
  enterprise: 'Enterprise',
};

/**
 * Account/settings page: plan, contact email, password, notification prefs. Mock — no persistence.
 * @returns Account page React element
 */
export default function Account() {
  const tier = getMockTier();
  const planName = MOCK_PLAN_NAMES[tier] ?? 'Entry';
  const [email, setEmail] = useState('you@example.com');
  const [notifyBilling, setNotifyBilling] = useState(true);
  const [notifyDeploys, setNotifyDeploys] = useState(true);

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Account</h1>
        <p className="overview-hero-summary">
          Manage your plan, contact details, password, and notification preferences. (Mock — changes are not saved.)
        </p>
      </header>

      {/* Plan */}
      <section className="overview-section" aria-labelledby="account-plan-heading">
        <h2 id="account-plan-heading" className="overview-section-title">
          Plan
        </h2>
        <p className="overview-section-desc">
          Your current plan. To change plan, use the Project B portal.
        </p>
        <div className="ai-casing">
          <p className="account-plan-value">
            <strong>{planName}</strong>
          </p>
          <button type="button" className="usage-portal-btn">
            Go to Project B portal
          </button>
        </div>
      </section>

      {/* Contact & login */}
      <section className="overview-section" aria-labelledby="account-contact-heading">
        <h2 id="account-contact-heading" className="overview-section-title">
          Contact &amp; login
        </h2>
        <p className="overview-section-desc">
          Billing contact and login email. (Placeholder — not persisted.)
        </p>
        <div className="ai-casing">
          <div className="account-field">
            <label htmlFor="account-email" className="admin-label">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              style={{ maxWidth: '20rem' }}
            />
          </div>
          <button type="button" className="account-btn">
            Save
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="overview-section" aria-labelledby="account-password-heading">
        <h2 id="account-password-heading" className="overview-section-title">
          Password
        </h2>
        <p className="overview-section-desc">
          Change your password. (Mock — button does nothing.)
        </p>
        <div className="ai-casing">
          <button type="button" className="account-btn">
            Change password
          </button>
        </div>
      </section>

      {/* Notification preferences */}
      <section className="overview-section" aria-labelledby="account-notifications-heading">
        <h2 id="account-notifications-heading" className="overview-section-title">
          Notification preferences
        </h2>
        <p className="overview-section-desc">
          Choose which emails you receive. (Mock — checkboxes do not persist.)
        </p>
        <div className="ai-casing">
          <ul className="account-prefs-list">
            <li className="account-prefs-item">
              <label className="account-prefs-label">
                <input
                  type="checkbox"
                  checked={notifyBilling}
                  onChange={(e) => setNotifyBilling(e.target.checked)}
                  className="account-prefs-checkbox"
                />
                <span>Billing and usage alerts</span>
              </label>
            </li>
            <li className="account-prefs-item">
              <label className="account-prefs-label">
                <input
                  type="checkbox"
                  checked={notifyDeploys}
                  onChange={(e) => setNotifyDeploys(e.target.checked)}
                  className="account-prefs-checkbox"
                />
                <span>Deployment and build notifications</span>
              </label>
            </li>
          </ul>
          <button type="button" className="account-btn">
            Save preferences
          </button>
        </div>
      </section>
    </div>
  );
}
