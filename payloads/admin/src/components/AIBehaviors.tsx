/**
 * Mock: AI Behaviors (reusable AI profiles). Not chat windows — behavioral configs.
 * Placeholder for create/edit/delete, enable/disable, assign to apps.
 */
/**
 * Renders AI Behaviors mock page: placeholder for create/edit/delete, enable/disable, assign to apps.
 * @returns AI Behaviors mock page React element
 */
export default function AIBehaviors() {
  return (
    <div className="mock-page">
      <h1 className="mock-h1">AI Behaviors</h1>
      <p className="mock-p mock-muted">
        Named, reusable AI profiles. Apps and agents invoke them. Not chat windows. (Mock)
      </p>
      <section className="mock-section">
        <h2 className="mock-h2">Behaviors</h2>
        <ul className="mock-list">
          <li>Default assistant — enabled</li>
          <li>[Placeholder: more behaviors]</li>
        </ul>
      </section>
      <section className="mock-section">
        <h2 className="mock-h2">Per behavior</h2>
        <ul className="mock-list">
          <li>Name, description / intent</li>
          <li>System prompt, allowed tools, constraints</li>
          <li>Status (enabled/disabled)</li>
          <li>Assign to apps</li>
        </ul>
      </section>
      <p className="mock-p">[Placeholder: Create / Edit / Delete]</p>
    </div>
  );
}
