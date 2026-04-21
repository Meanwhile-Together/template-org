# payload-admin

**Admin is only this repo.** Standalone SPA for the Project B admin (control-panel). project-bridge does not depend on it; the unified server serves it from config when the admin app is configured.

**Workspace:** Place this repo alongside `project-bridge` (e.g. under `MT/`). It depends on project-bridge packages (engine, shared, ui) via `file:../project-bridge/...`.

```bash
# From payload-admin root (with project-bridge as sibling)
npm install
npm run build
```

Output: `dist/` (index.html + assets). Point project-bridge server config at this repo with `source.path: "../payload-admin"` and `staticDir: "dist"`.

- **Dev:** `npm run dev` — Vite dev server (port 5174), proxies `/api` to the project-bridge server (e.g. localhost:3001). When you access the admin via the backend server (e.g. http://localhost:3002), set `VITE_HMR_PROXY_PORT=3002` so HMR connects through the proxy (e.g. `VITE_HMR_PROXY_PORT=3002 npm run dev`).
- **Build:** `npm run build` — Vite build to `dist/`.
