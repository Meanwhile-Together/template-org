/**
 * Users & access page — tenant-scoped user management (launch-plan Workstream 1b / 6).
 *
 * Wired to the users addon (`${ADMIN_API_BASE}/users` + `/invites`). Falls back to the mock data set
 * below when the endpoints return 501 (adapter not configured on host) so local dev stays usable.
 */
import { useEffect, useState } from 'react';
import { ADMIN_API_BASE, adminUrl } from '../data/adminApi';

type TenantRole = 'owner' | 'admin' | 'member' | 'read-only';

interface Member {
  id: string;
  email: string;
  name?: string | null;
  role: TenantRole;
  createdAt: string;
}

interface Invite {
  token: string;
  email: string;
  role: TenantRole;
  createdAt: string;
  expiresAt: string;
}

const ROLE_OPTIONS: TenantRole[] = ['owner', 'admin', 'member', 'read-only'];

const MOCK_MEMBERS: Member[] = [
  { id: '1', email: 'alice@example.com', name: 'Alice', role: 'member', createdAt: '2024-01-15' },
  { id: '2', email: 'bob@example.com', name: 'Bob', role: 'member', createdAt: '2024-02-20' },
  { id: '3', email: 'you@project.com', name: 'You', role: 'owner', createdAt: '2024-01-01' },
];

function authHeaders(): Record<string, string> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('backend_auth_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Users() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState<boolean>(true);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TenantRole>('member');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mr, ir] = await Promise.all([
        fetch(adminUrl('/users'), { headers: authHeaders() }),
        fetch(adminUrl('/users/invites'), { headers: authHeaders() }),
      ]);
      if (mr.status === 501 || ir.status === 501) {
        setConfigured(false);
        setMembers(MOCK_MEMBERS);
        setInvites([]);
        return;
      }
      const mbody = mr.ok ? await mr.json() : { members: [] };
      const ibody = ir.ok ? await ir.json() : { invites: [] };
      setMembers(Array.isArray(mbody.members) ? mbody.members : []);
      setInvites(Array.isArray(ibody.invites) ? ibody.invites : []);
      setConfigured(true);
    } catch {
      setConfigured(false);
      setMembers(MOCK_MEMBERS);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const onInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteBusy(true);
    setInviteNotice(null);
    try {
      const res = await fetch(adminUrl('/users/invites'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.status === 501) {
        setInviteNotice('User management is not wired on this host yet.');
      } else if (res.ok) {
        setInviteEmail('');
        setInviteRole('member');
        setInviteNotice('Invite sent.');
        await loadAll();
      } else {
        const data = await res.json().catch(() => ({}));
        setInviteNotice(data?.error ?? 'Failed to send invite.');
      }
    } finally {
      setInviteBusy(false);
    }
  };

  const onRevokeInvite = async (token: string) => {
    await fetch(`${ADMIN_API_BASE}/users/invites/${encodeURIComponent(token)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await loadAll();
  };

  const onChangeRole = async (userId: string, role: TenantRole) => {
    await fetch(`${ADMIN_API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ role }),
    });
    await loadAll();
  };

  const onRemove = async (userId: string) => {
    if (!window.confirm('Remove this user from the tenant? They will lose access immediately.')) return;
    await fetch(`${ADMIN_API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await loadAll();
  };

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">Users &amp; access</h1>
        <p className="overview-hero-summary">
          Invite people to your tenant, manage their roles, and remove anyone who no longer needs access.
        </p>
      </header>

      {!configured && (
        <section className="overview-section" aria-labelledby="users-notice-heading">
          <h2 id="users-notice-heading" className="overview-section-title">Preview mode</h2>
          <p className="overview-section-desc">
            The users API isn't configured on this host yet. Showing mock data — wire a
            <code> UserManagementAdapter </code> into <code>createUsersAddon</code> to make changes real.
          </p>
        </section>
      )}

      <section className="overview-section" aria-labelledby="users-invite-heading">
        <h2 id="users-invite-heading" className="overview-section-title">Invite someone</h2>
        <div className="ai-casing">
          <div className="account-field">
            <label htmlFor="invite-email" className="admin-label">Email</label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="admin-input"
              placeholder="teammate@example.com"
              style={{ maxWidth: '20rem' }}
            />
          </div>
          <div className="account-field">
            <label htmlFor="invite-role" className="admin-label">Role</label>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TenantRole)}
              className="admin-input"
              style={{ maxWidth: '12rem' }}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="usage-portal-btn"
            disabled={inviteBusy || !inviteEmail.trim() || !configured}
            onClick={() => void onInvite()}
          >
            {inviteBusy ? 'Sending…' : 'Send invite'}
          </button>
          {inviteNotice && <p className="overview-section-desc" style={{ marginTop: '0.5rem' }}>{inviteNotice}</p>}
        </div>
      </section>

      <section className="overview-section" aria-labelledby="users-members-heading">
        <h2 id="users-members-heading" className="overview-section-title">Members</h2>
        <p className="overview-section-desc">Everyone with access to this tenant.</p>
        {loading ? (
          <p className="overview-section-desc" style={{ padding: '1rem 0' }}>Loading…</p>
        ) : (
          <div className="mock-table-wrap">
            <table className="mock-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name ?? '—'}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => void onChangeRole(u.id, e.target.value as TenantRole)}
                        disabled={!configured}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td>{u.createdAt}</td>
                    <td>
                      <button
                        type="button"
                        className="mock-btn mock-btn-small"
                        disabled={!configured}
                        onClick={() => void onRemove(u.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {invites.length > 0 && (
        <section className="overview-section" aria-labelledby="users-invites-heading">
          <h2 id="users-invites-heading" className="overview-section-title">Pending invites</h2>
          <div className="mock-table-wrap">
            <table className="mock-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Sent</th>
                  <th>Expires</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.token}>
                    <td>{inv.email}</td>
                    <td>{inv.role}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="mock-btn mock-btn-small"
                        onClick={() => void onRevokeInvite(inv.token)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
