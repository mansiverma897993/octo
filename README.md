# Mobile Dev Control v3 (Production SaaS Baseline)

Secure, multi-tenant mobile-driven development command system.

## What’s implemented
1. **Postgres-backed approvals/users/projects** with SQL migrations and data-access layer (no ORM)
2. **Web dashboard (mobile-friendly)** at `/dashboard` for pending approvals + approve/reject/status
3. **Multi-tenant model + RBAC**: orgs/projects/users/memberships/roles integrated in command flow
4. **Tests + CI**: unit + integration tests, GitHub Actions lint/test workflow
5. **Docker Compose stack**: postgres + backend + local-agent + web
6. **Deployment docs** in `docs/deployment.md`

Security remains strict:
- No raw shell passthrough
- Intent + policy checks
- Agent command templates only (`spawn` shell disabled)
- Signed backend→agent envelopes + shared-secret verification

---

## Quick start (end-to-end)

```bash
cp backend/.env.example backend/.env
cp local-agent/.env.example local-agent/.env
# Fill secrets in backend/.env and local-agent/.env

npm install
npm test

docker compose up --build
```

Then open:
- API + dashboard: `http://localhost:8080/dashboard`
- Web container: `http://localhost:3000`

Use seeded token/project from `backend/.env`:
- `SEED_ADMIN_API_TOKEN`
- `SEED_PROJECT_SLUG`

In dashboard, enter token + project slug and manage approvals.

---

## API examples

```bash
curl -X POST http://localhost:8080/api/commands/interpret-and-run \
  -H "Authorization: Bearer dev-admin-token" \
  -H "x-project-slug: default-project" \
  -H "Content-Type: application/json" \
  -d '{"text":"create nextjs app named admin-panel"}'
```

Approval endpoints:
- `GET /api/commands/approval?status=PENDING`
- `POST /api/commands/approval/:id/approve`
- `POST /api/commands/approval/:id/reject`
- `GET /api/commands/approval/:id`

---

## Repo scripts

At repo root:
- `npm install`
- `npm run lint`
- `npm test`

