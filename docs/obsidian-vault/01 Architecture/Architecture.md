# Architecture

```mermaid
flowchart TD
  U[User / Browser] --> FE[React + Vite + Tailwind<br/>nginx in Docker]
  FE -- REST /api --> API[Node + Express]
  API --> DB[(MongoDB)]
  AI[AI assistant<br/>Claude Desktop / Claude Code] -- MCP stdio --> MCP[MCP server]
  MCP -- REST + JWT --> API
  GH[GitHub Actions CI] --> IMG[Docker images]
  IMG --> AWS[AWS EC2 / S3]
  IMG --> AZ[Azure App Service]
  TF[Terraform] --> AWS
  TF --> AZ
```

## Key design decisions
- **RBAC at the route layer**: `protect` (JWT) then `authorize(...roles)`. EMPLOYEE users are additionally scoped in the controller to assets assigned to their linked Employee record.
- **Asset state machine**: `AVAILABLE -> ASSIGNED -> (transfer) -> AVAILABLE`, `* -> MAINTENANCE -> back`, `AVAILABLE -> RETIRED`. Illegal transitions return 409.
- **Audit log**: every create/update/assign/transfer/return/maintenance/delete writes an append-only `AssetHistory` row (asset code is denormalised so it survives deletion).
- **MCP server uses the REST API**, not the database, so permissions and validation are never bypassed.
- **Validation** with zod on every write endpoint; one error handler returns `{ message, errors[] }`.
