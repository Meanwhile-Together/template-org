# Deploying the master backend (central auth)

The **master backend** is the deployment that serves **central admin auth** (`/auth`). Project backends **verify** JWTs; they do not replace the master login.

For **layout** (two Railway services, one binary, payloads), see **[docs/CURRENT_ARCHITECTURE.md](../docs/CURRENT_ARCHITECTURE.md)**. Thin auth/CORS/UI injection: **[docs/MASTER_ADMIN_LAYER.md](../docs/MASTER_ADMIN_LAYER.md)**.

## Unified server

- **Binary:** `targets/server` only (`node targets/server/dist/index.js`).
- **Backend mode:** `config/server.json` lists a payload with **`slug: "admin"`** whose **`source`** points at **payload-admin** `dist/` (e.g. sibling `../payload-admin` locally, or **`source.git`** / vendored path in CI).
- **Admin static:** Built with **`npm run build:backend`** (runs **`scripts/build-admin-payload.sh`** when **`../payload-admin`** exists), not a legacy **`targets/backend`** tree.
- **`RUN_AS_MASTER=1`:** Mounts `/auth` and master addon; use **`mtx deploy asadmin`** to set env on the backend service.

## Master backend: environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RUN_AS_MASTER` | Yes | `true` or `1` — mount `/auth`, issue admin JWTs. |
| `MASTER_JWT_SECRET` | Yes | Signing secret; **same** value on every project backend for verification. |
| `MASTER_AUTH_ISSUER` | No | JWT `iss` (default `master`). |
| `MASTER_CORS_ORIGINS` | Production | Comma-separated origins for `/auth` (e.g. `https://backend-staging.railway.app`). |
| `DATABASE_URL` | Production | Postgres for BackendUser; SQLite possible in dev. |

## Project backend: environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MASTER_JWT_SECRET` | Yes | Verify master-issued tokens only. |
| `MASTER_AUTH_ISSUER` | No | Expected issuer (default `master`). |

## Project admin UI (Vite)

When the admin SPA should log in against the **master** host, set at **build time**:

| Variable | Description |
|----------|-------------|
| `VITE_MASTER_AUTH_URL` | Base URL for auth (e.g. `https://master-backend.up.railway.app/auth`). |

```bash
VITE_MASTER_AUTH_URL=https://your-master-backend.up.railway.app/auth npm run build
```

## Build before deploy

```bash
npm run build:server
npm run build:backend   # sibling payload-admin
```

Order matches **`terraform/apply.sh`** (backend lane).

## Terraform note

**Project** backends (`backend-staging` / `backend-production`) are created by normal **`mtx deploy`**. A **dedicated** “platform master” in a **separate** Railway project is still an **optional** ops choice — document that project’s deploy separately; do not confuse with the default two-service layout.

## apply.sh and secrets

`MASTER_JWT_SECRET` in `.env` is propagated to backend services when **`apply.sh`** deploys them (Railway CLI). If CLI fails, set vars in the Railway dashboard.
