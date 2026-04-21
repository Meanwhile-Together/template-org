# template-org / config

Per the config triad (rule-of-law §1 2026-04-20):

- **`org.json`** (tracked) — this org's canonical identity. Top-level **`org`**
  key: `name`, `slug`, `owner`, `version`; plus org-level `ai`, `chatbots`, and
  `development` / `staging` / `production` environment blocks. Source of truth
  for the host. `mtx create org` rewrites `org.name`, `org.slug`, `org.owner`,
  `org.version` from the create prompts. An `app.json` at this path is **not
  allowed** here — that name belongs to payloads only.

- **`server.json`** — runtime, gitignored. Copy from `server.json.example` on
  clone. Routing-only: `server.{port,projectRoot,stateDir,backendAddons,env}`,
  **`server.host`** (mount fields for the org shell: `pathPrefix`, `staticDir`,
  `apiPrefix`, `runAsMaster`, `domains`), **`apps[]`** (pure payload registry:
  `{id, source, pathPrefix?, staticDir?, apiPrefix?, runAsMaster?, domains?}`).
  Do **not** put payload identity (`app.name` / `app.slug` / `ai` / `chatbots`)
  here — each payload ships its own `config/app.json`.

- **`backend.json`** — runtime, gitignored. Secrets, DB URLs, provider keys.
  Schema: `backend.example.json`. Shared loader auto-copies `backend.example.json`
  → `backend.json` on first boot if the example is complete.

- **`deploy.json`** — runtime, gitignored. Deployment platform + Railway project
  pin. Schema: `deploy.example.json`.

- **`payload-manifest.example.json`** — schema for `mtx payload install`
  multi-payload manifests (optional batch install).

Never add `config/app.json` to an org. The loader tolerates it as a legacy
fallback but `org.json` wins when both exist.
