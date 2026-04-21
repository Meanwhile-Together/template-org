/**
 * Configuration Editor: load/save app config (app name, version, dev/prod/staging URLs, chatbots) via /api/config.
 * Requires auth for POST; GET supports ?all=true for full config.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@meanwhile-together/shared';

/** Port and URL for an environment. */
interface EnvironmentBlock {
  port: number;
  url: string;
}

interface AppConfig {
  app: { name: string; version: string };
  server: { port: number; mode: 'development' | 'production' | 'staging'; apiUrl: string };
  development?: EnvironmentBlock;
  production?: EnvironmentBlock;
  staging?: EnvironmentBlock;
  chatbots: Array<{
    id: string;
    name: string;
    provider: string;
    model: string;
    preWarmingPrompt: string;
    config: { temperature: number; maxTokens: number };
  }>;
}

/**
 * Renders form for app config, environments, and chatbot pre-warming prompts; loads on mount, save via POST.
 * @returns Config editor React element
 */
export default function ConfigEditor() {
  const { getAuthToken } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config?all=true');
      if (response.ok) {
        const data = await response.json();
        const env = data.environment ?? { port: 3001, url: 'http://localhost' };
        if (!data.development) data.development = data.mode === 'development' ? env : { port: 3001, url: 'http://localhost' };
        if (!data.production) data.production = data.mode === 'production' ? env : { port: 3001, url: 'https://api.example.com' };
        if (!data.staging) data.staging = data.mode === 'staging' ? env : { port: 3001, url: 'https://staging-api.example.com' };
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const token = await getAuthToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/config', { method: 'POST', headers, body: JSON.stringify(config) });
      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Config saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save config: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading configuration...</div>;
  if (!config) return <div className="loading">Failed to load configuration</div>;

  const section = 'mb-8';
  const grid = 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4';
  const field = 'mb-4';
  return (
    <div className="dashboard">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Configuration Editor</h2>
      <div className={section}>
        <h3 className="text-lg font-medium text-text-primary mb-2">App Configuration</h3>
        <div className={grid}>
          <div className={field}>
            <label className="admin-label">App Name</label>
            <input type="text" className="admin-input" value={config.app.name} onChange={(e) => setConfig({ ...config, app: { ...config.app, name: e.target.value } })} />
          </div>
          <div className={field}>
            <label className="admin-label">Version</label>
            <input type="text" className="admin-input" value={config.app.version} onChange={(e) => setConfig({ ...config, app: { ...config.app, version: e.target.value } })} />
          </div>
        </div>
      </div>
      <div className={section}>
        <h3 className="text-lg font-medium text-text-primary mb-2">Development</h3>
        <div className={grid}>
          <div className={field}>
            <label className="admin-label">URL</label>
            <input type="text" className="admin-input" value={config.development?.url ?? 'http://localhost'} onChange={(e) => setConfig({ ...config, development: { ...(config.development ?? { port: 3001, url: 'http://localhost' }), url: e.target.value } })} />
          </div>
          <div className={field}>
            <label className="admin-label">Port</label>
            <input type="number" className="admin-input" value={config.development?.port ?? 3001} onChange={(e) => setConfig({ ...config, development: { ...(config.development ?? { port: 3001, url: 'http://localhost' }), port: parseInt(e.target.value, 10) } })} />
          </div>
        </div>
      </div>
      <div className={section}>
        <h3 className="text-lg font-medium text-text-primary mb-2">Production</h3>
        <div className={grid}>
          <div className={field}>
            <label className="admin-label">URL</label>
            <input type="text" className="admin-input" value={config.production?.url ?? 'https://api.example.com'} onChange={(e) => setConfig({ ...config, production: { ...(config.production ?? { port: 3001, url: 'https://api.example.com' }), url: e.target.value } })} />
          </div>
          <div className={field}>
            <label className="admin-label">Port</label>
            <input type="number" className="admin-input" value={config.production?.port ?? 3001} onChange={(e) => setConfig({ ...config, production: { ...(config.production ?? { port: 3001, url: 'https://api.example.com' }), port: parseInt(e.target.value, 10) } })} />
          </div>
        </div>
      </div>
      <div className={section}>
        <h3 className="text-lg font-medium text-text-primary mb-2">Staging</h3>
        <div className={grid}>
          <div className={field}>
            <label className="admin-label">URL</label>
            <input type="text" className="admin-input" value={config.staging?.url ?? 'https://staging-api.example.com'} onChange={(e) => setConfig({ ...config, staging: { ...(config.staging ?? { port: 3001, url: 'https://staging-api.example.com' }), url: e.target.value } })} />
          </div>
          <div className={field}>
            <label className="admin-label">Port</label>
            <input type="number" className="admin-input" value={config.staging?.port ?? 3001} onChange={(e) => setConfig({ ...config, staging: { ...(config.staging ?? { port: 3001, url: 'https://staging-api.example.com' }), port: parseInt(e.target.value, 10) } })} />
          </div>
        </div>
      </div>
      <div className={section}>
        <h3 className="text-lg font-medium text-text-primary mb-2">Chatbots</h3>
        {config.chatbots.map((bot, index) => (
          <div key={bot.id} className="admin-card">
            <h4 className="font-medium text-text-primary mb-2">{bot.name}</h4>
            <div className="mt-4">
              <label className="admin-label">Pre-warming Prompt</label>
              <textarea className="admin-input min-h-[100px]" value={bot.preWarmingPrompt} onChange={(e) => { const newChatbots = [...config.chatbots]; newChatbots[index] = { ...bot, preWarmingPrompt: e.target.value }; setConfig({ ...config, chatbots: newChatbots }); }} />
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={saveConfig} disabled={saving} className="admin-btn-primary px-8 py-3">
        {saving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
}
