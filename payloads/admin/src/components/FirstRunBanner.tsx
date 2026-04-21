/**
 * Mock: First-run onboarding banner. Dismissible checklist; close hides it (localStorage).
 * Checkboxes and buttons do nothing. No backend.
 */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'admin-first-run-dismissed';

const CHECKLIST_ITEMS = [
  'Open your first app',
  'Set up AI',
  'Invite a user',
];

/**
 * Dismissible first-run checklist banner. Dismissal persisted in localStorage; checkboxes/buttons are placeholder.
 * @returns Banner element or null when dismissed
 */
export default function FirstRunBanner() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setDismissed(stored === 'true');
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  if (dismissed === null || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Getting started"
      style={{
        marginBottom: '1.75rem',
        padding: '1.5rem 1.75rem',
        border: '1px solid #c5d0de',
        borderRadius: '10px',
        backgroundColor: '#f0f4f8',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1a1a1a',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            Getting started
          </h2>
          <p
            style={{
              margin: '0.5rem 0 1rem 0',
              fontSize: '0.9375rem',
              color: '#374151',
              lineHeight: 1.5,
              maxWidth: '36em',
            }}
          >
            Complete these steps to get the most out of your admin panel.
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {CHECKLIST_ITEMS.map((label, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                  borderBottom: i < CHECKLIST_ITEMS.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.25rem',
                    height: '1.25rem',
                    flexShrink: 0,
                    border: '2px solid #64748b',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                  }}
                  aria-hidden
                />
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#1e293b' }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            flexShrink: 0,
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1e293b',
            backgroundColor: '#fff',
            border: '1px solid #94a3b8',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#64748b';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#94a3b8';
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
