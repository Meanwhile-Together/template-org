/**
 * Admin payload SPA entry: ConfigProvider, AuthProvider, and App.
 * When set, Project admin UI logs in against the master backend.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, ConfigProvider } from '@meanwhile-together/shared';
import App from './App';
import '@meanwhile-together/ui/styles/globals.css';
import './styles.css';
import './admin-theme.css';

const masterAuthUrl =
  (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_MASTER_AUTH_URL) ||
  (typeof process !== 'undefined' && (process as NodeJS.Process & { env?: Record<string, string> }).env?.MASTER_AUTH_URL) ||
  '';

const backendAuthConfig = {
  authBasePath: masterAuthUrl || '/auth',
  tokenKey: 'backend_auth_token',
  userKey: 'backend_auth_user',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider initialConfig={{ app: { name: 'Project B Backend Panel', version: '1.0.0' } }}>
      <AuthProvider config={backendAuthConfig}>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
