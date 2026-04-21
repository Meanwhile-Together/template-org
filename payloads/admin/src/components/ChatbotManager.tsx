/**
 * Chatbot Manager: list, add, edit, delete chatbots. Loads from /api/config; saves via POST with auth.
 * Uses modal forms for add and edit.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@meanwhile-together/shared';

/** Chatbot record: id, name, provider, model, preWarmingPrompt, config (temperature, maxTokens). */
interface Chatbot {
  id: string;
  name: string;
  provider: string;
  model: string;
  preWarmingPrompt: string;
  config: { temperature: number; maxTokens: number };
}

/**
 * Renders chatbot list, add/edit/delete actions, and modal forms. Must be used within auth context.
 * @returns Chatbot manager React element
 */
export default function ChatbotManager() {
  const { getAuthToken } = useAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState<Chatbot | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        setChatbots(config.chatbots || []);
      }
    } catch (error) {
      console.error('Failed to load chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChatbots = async (updatedChatbots: Chatbot[]) => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        const updatedConfig = { ...config, chatbots: updatedChatbots };
        const token = await getAuthToken();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const saveResponse = await fetch('/api/config', { method: 'POST', headers, body: JSON.stringify(updatedConfig) });
        if (saveResponse.ok) {
          setChatbots(updatedChatbots);
          alert('Chatbots updated successfully!');
        } else {
          alert('Failed to save chatbots');
        }
      }
    } catch (error) {
      console.error('Failed to save chatbots:', error);
      alert('Failed to save chatbots');
    }
  };

  const deleteChatbot = (id: string) => {
    if (confirm('Are you sure you want to delete this chatbot?')) {
      saveChatbots(chatbots.filter(bot => bot.id !== id));
    }
  };

  const addChatbot = (newBot: Omit<Chatbot, 'id'>) => {
    saveChatbots([...chatbots, { ...newBot, id: `bot-${Date.now()}` }]);
    setShowAddForm(false);
  };

  if (loading) return <div className="loading">Loading chatbots...</div>;

  return (
    <div className="dashboard">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Chatbot Manager</h2>
      <div className="welcome-card">
        <h3>Chatbot Configuration</h3>
        <p>Manage your AI chatbots, configure models, and set up pre-warming prompts.</p>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-medium text-text-primary mb-4">Current Chatbots ({chatbots.length})</h3>
        {chatbots.map((bot) => (
          <div key={bot.id} className="admin-card">
            <h4 className="font-medium text-text-primary mb-2">{bot.name}</h4>
            <p className="text-text-secondary text-sm"><strong>Provider:</strong> {bot.provider}</p>
            <p className="text-text-secondary text-sm"><strong>Model:</strong> {bot.model}</p>
            <p className="text-text-secondary text-sm"><strong>Status:</strong> Active</p>
            <p className="text-text-secondary text-sm"><strong>Temperature:</strong> {bot.config.temperature}</p>
            <p className="text-text-secondary text-sm"><strong>Max Tokens:</strong> {bot.config.maxTokens}</p>
            <p className="text-text-secondary text-sm"><strong>Pre-warming Prompt:</strong> {bot.preWarmingPrompt}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setEditingBot(bot)} className="admin-btn-primary">Edit</button>
              <button type="button" onClick={() => deleteChatbot(bot.id)} className="admin-btn-danger">Delete</button>
            </div>
          </div>
        ))}
        {chatbots.length === 0 && (
          <div className="text-center p-8 text-text-secondary border-2 border-dashed border-border-primary rounded-lg">
            <p>No chatbots configured yet.</p>
            <p>Click &quot;Add New Chatbot&quot; to get started.</p>
          </div>
        )}
      </div>
      <div className="mt-8">
        <button type="button" onClick={() => setShowAddForm(true)} className="admin-btn-success">+ Add New Chatbot</button>
      </div>
      {showAddForm && (
        <AddChatbotForm onAdd={addChatbot} onCancel={() => setShowAddForm(false)} />
      )}
      {editingBot && (
        <EditChatbotForm bot={editingBot} onSave={(updatedBot) => { saveChatbots(chatbots.map(bot => bot.id === updatedBot.id ? updatedBot : bot)); setEditingBot(null); }} onCancel={() => setEditingBot(null)} />
      )}
    </div>
  );
}

/** Modal form to add a new chatbot. */
function AddChatbotForm({ onAdd, onCancel }: { onAdd: (bot: Omit<Chatbot, 'id'>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({ name: '', provider: 'openai', model: 'gpt-4', preWarmingPrompt: '', temperature: 0.7, maxTokens: 2000 });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      provider: formData.provider,
      model: formData.model,
      preWarmingPrompt: formData.preWarmingPrompt,
      config: { temperature: formData.temperature, maxTokens: formData.maxTokens },
    });
  };
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <h3 className="text-lg font-medium text-text-primary mb-4">Add New Chatbot</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="admin-label">Name</label><input type="text" className="admin-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="mb-4"><label className="admin-label">Provider</label><select className="admin-input" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select></div>
          <div className="mb-4"><label className="admin-label">Model</label><input type="text" className="admin-input" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required /></div>
          <div className="mb-4"><label className="admin-label">Pre-warming Prompt</label><textarea className="admin-input min-h-[100px]" value={formData.preWarmingPrompt} onChange={(e) => setFormData({ ...formData, preWarmingPrompt: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="admin-label">Temperature</label><input type="number" min="0" max="2" step="0.1" className="admin-input" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} /></div>
            <div><label className="admin-label">Max Tokens</label><input type="number" min="1" className="admin-input" value={formData.maxTokens} onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })} /></div>
          </div>
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={onCancel} className="admin-btn-secondary">Cancel</button>
            <button type="submit" className="admin-btn-success">Add Chatbot</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Modal form to edit an existing chatbot. */
function EditChatbotForm({ bot, onSave, onCancel }: { bot: Chatbot; onSave: (bot: Chatbot) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({ name: bot.name, provider: bot.provider, model: bot.model, preWarmingPrompt: bot.preWarmingPrompt, temperature: bot.config.temperature, maxTokens: bot.config.maxTokens });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...bot, name: formData.name, provider: formData.provider, model: formData.model, preWarmingPrompt: formData.preWarmingPrompt, config: { temperature: formData.temperature, maxTokens: formData.maxTokens } }); };
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <h3 className="text-lg font-medium text-text-primary mb-4">Edit Chatbot: {bot.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="admin-label">Name</label><input type="text" className="admin-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="mb-4"><label className="admin-label">Provider</label><select className="admin-input" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select></div>
          <div className="mb-4"><label className="admin-label">Model</label><input type="text" className="admin-input" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required /></div>
          <div className="mb-4"><label className="admin-label">Pre-warming Prompt</label><textarea className="admin-input min-h-[100px]" value={formData.preWarmingPrompt} onChange={(e) => setFormData({ ...formData, preWarmingPrompt: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="admin-label">Temperature</label><input type="number" min="0" max="2" step="0.1" className="admin-input" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} /></div>
            <div><label className="admin-label">Max Tokens</label><input type="number" min="1" className="admin-input" value={formData.maxTokens} onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })} /></div>
          </div>
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={onCancel} className="admin-btn-secondary">Cancel</button>
            <button type="submit" className="admin-btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
