/**
 * Mock: Non-technical view for managing users and access. Users in the project database; CRUD.
 */
import { useState } from 'react';

const MOCK_USERS = [
  { id: '1', email: 'alice@example.com', name: 'Alice', createdAt: '2024-01-15', role: 'member' },
  { id: '2', email: 'bob@example.com', name: 'Bob', createdAt: '2024-02-20', role: 'member' },
  { id: '3', email: 'you@project.com', name: 'You', createdAt: '2024-01-01', role: 'owner' },
];

/**
 * Renders Users & access page: list users, add/edit/delete (mock table and CRUD). Non-technical view.
 * @returns Users page React element
 */
export default function Users() {
  const [users, setUsers] = useState(MOCK_USERS);

  return (
    <div className="mock-page">
      <h1 className="mock-h1">Users &amp; access</h1>
      <p className="mock-section-goal">
        [UX spec] Non-technical view for managing users and access to the project. Applications in this project connect to a single database with a single user store; this tab shows who has accounts (who signed up on your applications) and who can access the project. Goal: let the user see users in their database and perform CRUD (create, read, update, delete) without touching the database directly. Minimum: list users, add user, edit user, delete user.
      </p>

      <section className="mock-section">
        <div className="mock-section-header">
          <h2 className="mock-h2">Users in your project</h2>
          <button type="button" className="mock-btn mock-btn-small">+ Add user</button>
        </div>
        <p className="mock-section-goal">
          [UX spec] Users in the project database—people who have accounts on your applications or who have been invited to the project. List is the primary view; each row supports edit and delete.
        </p>
        <div className="mock-table-wrap">
          <table className="mock-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.createdAt}</td>
                  <td>
                    <button type="button" className="mock-btn mock-btn-small">Edit</button>
                    {' '}
                    <button
                      type="button"
                      className="mock-btn mock-btn-small"
                      onClick={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="mock-p mock-muted">No users. Add a user to get started.</p>
        )}
      </section>

      <section className="mock-section">
        <h2 className="mock-h2">User database browser</h2>
        <p className="mock-section-goal">
          Browse the project user store (who has accounts on your applications). Same data as the list above, shown as a database view. For per-app data, use the Database browser on each app’s drill-down page.
        </p>
        <div className="mock-table-wrap">
          <table className="mock-table">
            <thead>
              <tr>
                <th>id</th>
                <th>email</th>
                <th>name</th>
                <th>role</th>
                <th>createdAt</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="mock-p mock-muted">No rows in user store.</p>
        )}
      </section>

      <section className="mock-section">
        <h2 className="mock-h2">CRUD</h2>
        <p className="mock-section-goal">
          [UX spec] Minimum interactions: Create (add user), Read (list above), Update (edit user), Delete (remove user). Optional later: invite by email, assign role (owner / admin / member / read-only), reset password, revoke sessions. Keep language non-technical.
        </p>
        <ul className="mock-list">
          <li><strong>Create</strong> — Add user (button above)</li>
          <li><strong>Read</strong> — List users in your project (table above)</li>
          <li><strong>Update</strong> — Edit user (Edit per row)</li>
          <li><strong>Delete</strong> — Remove user (Delete per row)</li>
        </ul>
      </section>
    </div>
  );
}
