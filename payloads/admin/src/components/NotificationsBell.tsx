/**
 * Mock: Alerts and notifications. Bell icon in header; dropdown with mock notifications.
 */
import React, { useState, useRef, useEffect } from 'react';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Usage at 80%', body: 'Project usage is at 80% of your monthly limit.', at: '2h ago', unread: true },
  { id: '2', title: 'Build failed', body: 'Build failed for Symptom tracker.', at: '1d ago', unread: true },
  { id: '3', title: 'Deployment succeeded', body: 'Health app was deployed to production.', at: '2d ago', unread: false },
];

/**
 * Header notifications bell: toggles dropdown with mock notifications. Click outside closes.
 * @returns Bell button and dropdown React element
 */
export const NotificationsBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-lg cursor-pointer transition-all text-lg text-text-primary hover:bg-bg-hover relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        title="Notifications"
      >
        <span className="block leading-none">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-text-inverse bg-accent-primary rounded-full"
            aria-hidden
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-auto bg-bg-secondary border border-border-primary rounded-lg shadow-lg py-2 z-[1100]"
          role="menu"
          aria-label="Notifications"
        >
          <div className="px-3 py-2 border-b border-border-primary">
            <span className="text-sm font-medium text-text-primary">Notifications</span>
          </div>
          <ul className="divide-y divide-border-primary">
            {MOCK_NOTIFICATIONS.map((n) => (
              <li
                key={n.id}
                className={`px-3 py-2 text-left cursor-default ${n.unread ? 'bg-bg-active/50' : ''}`}
              >
                <div className="text-sm font-medium text-text-primary">{n.title}</div>
                <div className="text-xs text-text-secondary mt-0.5">{n.body}</div>
                <div className="text-xs text-text-secondary mt-0.5">{n.at}</div>
              </li>
            ))}
          </ul>
          {MOCK_NOTIFICATIONS.length === 0 && (
            <div className="px-3 py-4 text-sm text-text-secondary text-center">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
