/**
 * Mock: AI control center. Default behaviors (chatbots) are primary; connect accounts collapsed; AI per app = link to app page; agents collapsed.
 */
import { useState } from 'react';

const SUPPORTED_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, etc.' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude' },
  { id: 'google', name: 'Google AI', description: 'Gemini' },
  { id: 'together', name: 'Together', description: 'Open models' },
  { id: 'groq', name: 'Groq', description: 'Fast inference' },
  { id: 'huggingface', name: 'Hugging Face', description: 'Models and inference' },
] as const;

const DEFAULT_BEHAVIORS = [
  { id: 'support', name: 'Customer Support Bot', provider: 'OpenAI', model: 'gpt-4', isDefault: true },
];

/**
 * AI control center: default behaviors list, collapsible "Connect your AI accounts", collapsible "Agents". Mock.
 * @returns AI page React element
 */
export default function AI() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);

  return (
    <div className="overview-page">
      <header className="overview-hero">
        <h1 className="overview-hero-title">AI</h1>
        <p className="overview-hero-summary">
          Connect providers, manage default behaviors, and configure agents. App-specific AI is set on each app page.
        </p>
      </header>

      {/* Primary: default AI behaviors */}
      <section className="overview-section" aria-labelledby="ai-behaviors-heading">
        <h2 id="ai-behaviors-heading" className="overview-section-title">
          Default AI behaviors
        </h2>
        <p className="overview-section-desc">
          Project-level chatbots used when an app doesn’t specify one. Each has name, provider, model, system prompt, temperature, and max tokens.
        </p>
        <div className="ai-casing">
          <ul className="ai-behavior-list">
            {DEFAULT_BEHAVIORS.map((b) => (
              <li key={b.id} className="ai-behavior-item">
                <div className="ai-behavior-head">
                  <strong className="ai-behavior-name">{b.name}</strong>
                  {b.isDefault && <span className="ai-behavior-badge">Default</span>}
                </div>
                <div className="ai-behavior-meta">
                  {b.provider} · {b.model}
                </div>
              </li>
            ))}
          </ul>
          <p className="ai-casing-note">[Placeholder: add behavior, edit, set default]</p>
        </div>
      </section>

      {/* Secondary: connect AI accounts (collapsible) */}
      <section className="overview-section ai-collapsible-section" aria-labelledby="ai-connect-heading">
        <button
          type="button"
          className="ai-collapsible-heading"
          onClick={() => setConnectOpen((o) => !o)}
          aria-expanded={connectOpen}
          id="ai-connect-heading"
        >
          <span className="ai-collapsible-chevron" aria-hidden>{connectOpen ? '▼' : '▶'}</span>
          Connect your AI accounts
        </button>
        {connectOpen && (
          <div className="ai-collapsible-body">
            <p className="overview-section-desc">
              Add API keys per provider to use OpenAI, Anthropic, Google, and others.
            </p>
            <ul className="ai-provider-list">
              {SUPPORTED_PROVIDERS.map((p) => (
                <li key={p.id} className="ai-provider-item">
                  <div className="ai-provider-info">
                    <strong className="ai-provider-name">{p.name}</strong>
                    <span className="ai-provider-desc">{p.description}</span>
                  </div>
                  <span className="ai-provider-status">Not connected</span>
                  <button type="button" className="ai-provider-action">Add API key</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <p className="overview-section-desc overview-section-desc--standalone">
        To change AI settings for a specific app, open that app from the Overview or Apps page.
      </p>

      {/* Tertiary: agents (collapsible) */}
      <section className="overview-section ai-collapsible-section" aria-labelledby="ai-agents-heading">
        <button
          type="button"
          className="ai-collapsible-heading"
          onClick={() => setAgentsOpen((o) => !o)}
          aria-expanded={agentsOpen}
          id="ai-agents-heading"
        >
          <span className="ai-collapsible-chevron" aria-hidden>{agentsOpen ? '▼' : '▶'}</span>
          Agents
        </button>
        {agentsOpen && (
          <div className="ai-collapsible-body">
            <p className="overview-section-desc">
              Agents run autonomously, switch between AI behaviors, and perform predefined tasks. Advanced; collapsed by default.
            </p>
            <ul className="ai-agent-bullets">
              <li>Run autonomously</li>
              <li>Switch between AI behaviors</li>
              <li>Predefined tasks</li>
            </ul>
            <p className="ai-casing-note">[Placeholder: agent list and settings]</p>
          </div>
        )}
      </section>
    </div>
  );
}
