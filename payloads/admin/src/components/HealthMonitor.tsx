/**
 * Health Monitor: displays server, database, and AI health status. Polls /api/hello every 30s.
 * Mock: database and AI are always "healthy"; only server status is updated from fetch.
 */
import { useState, useEffect } from 'react';

/** Per-system health state and last check time. */
interface HealthStatus {
  server: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  ai: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

function statusClass(status: string): string {
  switch (status) {
    case 'healthy': return 'status-healthy';
    case 'degraded': return 'status-degraded';
    case 'down': return 'status-down';
    default: return 'text-text-tertiary';
  }
}

/**
 * Renders health status cards for server, database, and AI, plus recent activity placeholder.
 * @returns Health monitor section React element
 */
export default function HealthMonitor() {
  const [health, setHealth] = useState<HealthStatus>({
    server: 'healthy',
    database: 'healthy',
    ai: 'healthy',
    lastCheck: new Date().toISOString()
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/hello');
        if (response.ok) {
          setHealth(prev => ({ ...prev, server: 'healthy', lastCheck: new Date().toISOString() }));
        } else {
          setHealth(prev => ({ ...prev, server: 'degraded', lastCheck: new Date().toISOString() }));
        }
      } catch {
        setHealth(prev => ({ ...prev, server: 'down', lastCheck: new Date().toISOString() }));
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="dashboard">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Health Monitor</h2>
      <div className="welcome-card">
        <h3>System Health Status</h3>
        <p>Monitor the health of all system components in real-time.</p>
        <p className="text-text-secondary mt-2"><strong>Last Check:</strong> {new Date(health.lastCheck).toLocaleString()}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="admin-card text-center">
          <h4 className="font-medium text-text-primary mb-2">Server</h4>
          <div className="text-3xl my-4">{getStatusIcon(health.server)}</div>
          <p className={`font-bold uppercase ${statusClass(health.server)}`}>{health.server}</p>
        </div>
        <div className="admin-card text-center">
          <h4 className="font-medium text-text-primary mb-2">Database</h4>
          <div className="text-3xl my-4">{getStatusIcon(health.database)}</div>
          <p className={`font-bold uppercase ${statusClass(health.database)}`}>{health.database}</p>
        </div>
        <div className="admin-card text-center">
          <h4 className="font-medium text-text-primary mb-2">AI Services</h4>
          <div className="text-3xl my-4">{getStatusIcon(health.ai)}</div>
          <p className={`font-bold uppercase ${statusClass(health.ai)}`}>{health.ai}</p>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-medium text-text-primary mb-2">Recent Activity</h3>
        <div className="admin-card">
          <p className="text-text-secondary">✅ Server health check completed successfully</p>
          <p className="text-text-secondary">✅ Configuration loaded from /api/config</p>
          <p className="text-text-secondary">✅ Admin panel loaded successfully</p>
          <p className="text-text-secondary">ℹ️ All systems operational</p>
        </div>
      </div>
    </div>
  );
}
