# Deployment (v3 SaaS baseline)

## One-command local/prod-like bootstrap

```bash
cp backend/.env.example backend/.env
cp local-agent/.env.example local-agent/.env
# edit backend/.env secrets (OPENAI, TELEGRAM, AGENT secrets)
docker compose up --build -d
```

Services:
- Postgres: `localhost:5432`
- Backend API + dashboard: `localhost:8080` (`/dashboard`)
- Local agent: `localhost:9090`
- Web shell: `localhost:3000`

## DB migrations
Migrations run automatically on backend startup from `backend/src/db/migrations/*.sql`.

## Seed admin
Backend startup auto-seeds:
- default org/project
- admin user + membership
- API token from `SEED_ADMIN_API_TOKEN`

Use token in dashboard and API:
- Header: `Authorization: Bearer <SEED_ADMIN_API_TOKEN>`
- Header: `x-project-slug: <SEED_PROJECT_SLUG>`

## CI
GitHub Actions workflow: `.github/workflows/ci.yml`
- `npm install`
- `npm run lint`
- `npm test`

## Production notes
- Use managed Postgres and set `DATABASE_URL`
- Rotate `AGENT_SHARED_SECRET`, `AGENT_JWT_SECRET`, API tokens
- Run backend/web behind TLS reverse proxy
- Lock local-agent network exposure (private only)
