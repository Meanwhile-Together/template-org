# template-org

Canonical **org-host** scaffold used by `mtx create org`. Successor to the legacy
`template-basic` (rule-of-law §6 2026-04-18 retire-template-basic; §1 2026-04-20
Config triad). **This repo is not a customer app** — it is the clone source only.

## Shape

- **`config/`** — the org's canonical config triad:
  - `org.json` — **org identity** (`org.name`, `org.slug`, `org.owner`, `org.version`;
    plus org-level `ai`, `chatbots`, and `development` / `staging` / `production`
    environment blocks). Source of truth for the host.
  - `server.json.example` — **routing-only** template. `server.{port,projectRoot,
    stateDir,backendAddons,env}`, **`server.host`** (mount fields for the org shell:
    `pathPrefix`, `staticDir`, `apiPrefix`, `runAsMaster`, `domains`), and **`apps[]`**
    (pure payload registry: `{id, source, pathPrefix?, staticDir?, apiPrefix?,
    runAsMaster?, domains?}`). Copy to `server.json` on clone.
  - `backend.example.json`, `deploy.example.json`, `payload-manifest.example.json`
    — reference schemas.
- **`payloads/`** — directory for **path-vendored** app trees (populated by `mtx deploy` /
  `vendor-payloads-from-config`, or `mtx payload install`). **Admin is not bundled**
  in this template: `config/server.json.example` registers admin with
  `source.path: "../payload-admin"`. Keep a sibling **`payload-admin`**
  checkout next to the org repo (same workspace parent as `MTX/` and `project-bridge/`).
  Other payloads still use `mtx payload install` from the new org root.
- **`scripts/`** — org host surface (`prepare-railway-artifact.sh`,
  `org-dev-server.sh`, `org-build-server.sh`, `railway-*.sh`,
  `generate-railway-deploy-manifest.sh`).
- **`targets/server`** — server harness + vendored npm-packs that reference
  `@meanwhile-together/demo` + `@meanwhile-together/engine`.
- **`terraform/`** — deploy surface (Railway apply/destroy, environments,
  modules). Reads `config/org.json.org.{name,slug,owner}` (with legacy fallback
  to `config/app.json.app.*`).
- **`railway.json`**, **`railpack.json`**, **`.railwayignore`** — deploy manifests.
- **`.env.example`** — shape for the per-deploy `.env` file. Copy to `.env` and
  fill in Railway tokens. **Never commit `.env`.**

## What `mtx create org` rewrites after cloning

- `package.json` — new `name`, `version`, and `description`.
- `README.md` — basic org-specific header.
- `config/org.json` — `org.name`, `org.slug`, `org.owner`, `org.version` stamped
  from the create prompts.
- `config/server.json` — generated from `config/server.json.example`; host-level
  `server.host` entries left at template defaults (edit post-clone if the org
  needs a non-default `pathPrefix` / `staticDir`).
- `backend.json` / `deploy.json` / `admin-grants.json` / `agent.json` — generated
  per prompt (or skipped with `--skip-configs`).

## Operator flow

1. `mtx create org <slug>` — clones this repo next to MTX, stamps identity, pushes
   a new GitHub repo when `gh` is authenticated.
2. Ensure **`payload-admin`** exists as a **sibling** repo (same folder that contains
   the new `org-*`). Admin is wired via `../payload-admin` in `config/server.json`.
   Install additional payloads with `mtx payload install` from the new org root.
3. `cp .env.example .env` — fill in Railway tokens.
4. `mtx deploy` — applies Terraform and deploys to Railway.

## Not the same as

- **`template-payload`** — single-app SPA scaffold for `mtx create payload`. A
  payload ships `config/app.json` only (no `server.json`, no `payloads/`, no
  `terraform/`).
- **Legacy `template-basic`** — identical ancestor of this repo under its old
  name. `template-basic` is deprecated and will be retired once external
  references are updated (rule-of-law §5 / §7).
