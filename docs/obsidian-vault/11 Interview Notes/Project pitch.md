# 60-second pitch
IT Asset Manager is a MERN app for tracking hardware: assignment/transfer workflows, maintenance, warranty alerts and a full audit trail, with JWT + role-based access (Admin / IT Staff / Employee).
An MCP server exposes read-only asset queries so an AI assistant can answer questions like "which laptops have warranties expiring this month?" through the same authenticated REST API.
It ships with Docker Compose, a GitHub Actions pipeline and Terraform starters for AWS and Azure.

## Be ready to explain
- Why the MCP server calls the API instead of the DB (RBAC/validation not bypassed)
- Why assign requires AVAILABLE status (state machine, 409 on bad transitions)
- Where JWT is stored on the client and the XSS trade-off
