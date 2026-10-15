# IT Asset Manager

Full-stack IT asset management: employees, laptops/desktops/mobiles, assignment & transfer, maintenance tracking, warranty alerts, dashboard/reports, audit log, JWT + role-based access, and a small **MCP server** so an AI assistant can query assets.

Built from the 7-day roadmap, starting from the `mern-thinkboard` skeleton (Express + Mongoose + Vite/React/Tailwind/DaisyUI).

## Features
- Roles: **ADMIN** (everything), **IT_STAFF** (assets, employees, maintenance, reports), **EMPLOYEE** (own assigned assets)
- Assets: auto asset IDs (`AST-00001`), serial numbers, search / filter / sort / pagination
- Assign, transfer, return (state-machine enforced), maintenance start/complete
- Dashboard with charts, warranty-expiry list, CSV export
- Append-only audit log of every change
- MCP tools: `get_asset`, `search_assets`, `get_employee_assets`, `get_expiring_warranties`, `get_asset_statistics`

## Tech stack
React 19 + Vite + Tailwind/DaisyUI + Recharts - Node 22 + Express 5 - MongoDB/Mongoose - JWT + bcrypt - zod - MCP SDK - Docker/Compose - GitHub Actions - Terraform (AWS, Azure)

## Project layout
```
backend/      Express API (controllers, models, routes, middleware, services, config)
frontend/     React app (pages, components, layouts, services, context)
mcp-server/   MCP server (stdio) -> REST API
terraform/    aws/ and azure/ starter stacks
docs/         architecture.md, api.md, obsidian-vault/
.github/workflows/ci.yml
docker-compose.yml
```

## Run locally
Requires Node 22+ and a MongoDB (local, Docker or Atlas).
```bash
# 1. backend
cd backend && cp .env.example .env     # set MONGO_URI and a strong JWT_SECRET
npm install
npm run seed                           # demo users + 24 assets (wipes the DB!)
npm run dev                            # http://localhost:5001

# 2. frontend (new terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```
Seeded logins (password = `SEED_PASSWORD`, default `ChangeMe123!`): `admin@example.com`, `it@example.com`, `priya@example.com` (employee).
**Change these passwords / never seed production.**

Backend tests: `cd backend && npm test`

## Docker
```bash
cp .env.example .env        # set JWT_SECRET
docker compose up --build   # app at http://localhost:8080
# optional demo data (wipes the DB; production mode needs an explicit override):
docker compose exec -e ALLOW_PRODUCTION_SEED=true -e SEED_PASSWORD='pick-a-password' backend node src/seed.js
```
nginx serves the SPA and proxies `/api` to the backend; MongoDB data lives in a named volume.

## Environment variables
| Var | Where | Purpose |
|---|---|---|
| `MONGO_URI` | backend | Mongo connection string (required) |
| `JWT_SECRET` | backend | signing secret (required; in production 32+ random chars, placeholders rejected) |
| `JWT_EXPIRES_IN` | backend | default `1d` |
| `CLIENT_ORIGIN` | backend | comma-separated allowed origins for CORS |
| `SEED_PASSWORD` | backend | seed script only (required when seeding in production) |
| `ALLOW_PRODUCTION_SEED` | backend | set `true` to let `seed.js` run with `NODE_ENV=production` |
| `VITE_API_URL` | frontend | leave empty to use the `/api` proxy |
| `API_URL`, `MCP_API_EMAIL`, `MCP_API_PASSWORD` | mcp-server | how the MCP server logs in to the API |

## MCP integration
```bash
cd mcp-server && npm install
```
Claude Code:
```bash
claude mcp add it-asset-manager \
  -e API_URL=http://localhost:5001/api -e MCP_API_EMAIL=it@example.com -e MCP_API_PASSWORD='...' \
  -- node /absolute/path/to/mcp-server/src/index.js
```
Claude Desktop (`claude_desktop_config.json`):
```json
{ "mcpServers": { "it-asset-manager": {
  "command": "node", "args": ["/absolute/path/to/mcp-server/src/index.js"],
  "env": { "API_URL": "http://localhost:5001/api", "MCP_API_EMAIL": "it@example.com", "MCP_API_PASSWORD": "..." } } } }
```
Then ask: *"Show me laptops whose warranty expires in the next 30 days."* All tools are read-only.

## CI/CD
`.github/workflows/ci.yml`: install -> backend tests -> frontend lint + build -> Docker image builds (no push yet). Next step: push images to GHCR/ECR/ACR and deploy.

## Cloud & Terraform (starters, not production-ready)
- `terraform/aws`: EC2 (IMDSv2, encrypted disk), security group (SSH restricted to your CIDR), private S3 bucket. Use MongoDB Atlas for the DB. Add CloudFront + OAC in front of S3 as a next step.
- `terraform/azure`: Linux App Service running the backend container image.
```bash
cd terraform/aws && terraform init && terraform plan -var admin_cidr="YOUR.IP/32"   # then apply / destroy
```
Secrets (`MONGO_URI`, `JWT_SECRET`) must come from Secrets Manager / Key Vault / CI secrets, never from the repo.

## Security checklist
- [x] JWT auth, bcrypt (cost 12), role checks on every route, employee row-level scoping
- [x] zod validation on all writes; Mongo regex input escaped; sort fields whitelisted
- [x] helmet, CORS allow-list, rate limiting (stricter on login)
- [x] No secrets in git (`.env` ignored; `.env.example` provided); app refuses to start without `JWT_SECRET` (and, in production, with a short or placeholder one)
- [ ] Token is stored in `localStorage` (simple, but exposed to XSS). Move to httpOnly cookies + CSRF protection for production.
- [ ] Add refresh tokens / account lockout, HTTPS termination, backups, integration tests

## Future improvements
Warranty-expiry email alerts (cron), asset QR labels, bulk CSV import, user management UI (API exists: `POST /api/auth/register`), integration tests with mongodb-memory-server, Playwright e2e, CloudFront/ALB + HTTPS in Terraform.

## API docs
See [docs/api.md](docs/api.md) and [docs/architecture.md](docs/architecture.md).
