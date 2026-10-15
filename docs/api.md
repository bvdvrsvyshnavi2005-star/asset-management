# REST API

All routes are under `/api`. Send `Authorization: Bearer <token>` except `/auth/login` and `/health`.
Roles: **A** = ADMIN, **S** = IT_STAFF, **E** = EMPLOYEE (own assets only).

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | /health | public | liveness |
| POST | /auth/login | public | `{email,password}` -> `{token,user}` (rate limited) |
| GET | /auth/me | all | current user |
| PUT | /auth/password | all | `{currentPassword,newPassword}` |
| POST | /auth/register | A | create user `{name,email,password,role,employee?}` |
| GET | /users | A | list users |
| GET | /assets | A S E | `search,status,category,assignedTo,warrantyWithinDays,sort,page,limit` |
| POST | /assets | A S | `assetId` optional (auto `AST-00001`) |
| GET | /assets/:id | A S E | `:id` = Mongo id or asset code |
| PUT | /assets/:id | A S | status may only be set to AVAILABLE/RETIRED |
| DELETE | /assets/:id | A | |
| GET | /assets/:id/history | A S E | |
| POST | /assets/:id/assign | A S | `{employeeId,note?}` asset must be AVAILABLE |
| POST | /assets/:id/transfer | A S | asset must be ASSIGNED |
| POST | /assets/:id/return | A S | |
| GET/POST | /employees | A S | search, pagination |
| GET/PUT | /employees/:id | A S | |
| DELETE | /employees/:id | A | 409 if assets still assigned |
| GET/POST | /maintenance | A S | |
| PUT | /maintenance/:id/complete | A S | `{cost?,note?}` |
| GET | /dashboard | A S E | counts + breakdowns (scoped for E) |
| GET | /reports/assets.csv | A S | CSV export |
| GET | /audit | A S | paginated audit log |

Paginated responses: `{ data, page, limit, total, pages }`.
