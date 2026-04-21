/**
 * Mock: Agents (advanced). Gated behind Advanced Settings.
 * Placeholder for autonomous agents, switching AI behaviors, predefined tasks.
 */
/**
 * Renders Agents mock page: placeholder for autonomous agents, behavior switching, predefined tasks.
 * @returns Agents mock page React element
 */
export default function Agents() {
  return (
    <div className="mock-page">
      <h1 className="mock-h1">Agents</h1>
      <p className="mock-p mock-muted">Advanced. Autonomous agents, behavior switching, predefined tasks. (Mock)</p>
      <section className="mock-section">
        <h2 className="mock-h2">Agent configuration</h2>
        <ul className="mock-list">
          <li>Run autonomously</li>
          <li>Switch between AI behaviors</li>
          <li>Predefined tasks</li>
        </ul>
      </section>
      <p className="mock-p mock-muted">[Placeholder: agent list and settings]</p>
    </div>
  );
}
