# MedInsight Backend

Node.js + Express + PostgreSQL backend, built against the approved ER diagram
(USERS, SESSIONS, REPORTS, SUMMARIES, CHAT_HISTORY).

## How this maps to the 7 required tasks

### 1. Backend Project Setup
- `package.json` — Express, pg, bcryptjs, jsonwebtoken, express-validator, helmet, cors, rate limiting
- `server.js` — app entry point, middleware order, route mounting
- `.env.example` — all required environment variables
- Folder structure: `config/`, `models/`, `controllers/`, `routes/`, `middleware/`, `utils/`, `tests/`
  (standard layered architecture: routes → controllers → models → db)

### 2. Database Implementation
- `config/schema.sql` — full DDL matching the ER diagram exactly:
  - `users` (PK `id`), `sessions` (FK `user_id`), `reports` (FK `user_id`),
    `summaries` (FK `report_id`, 1:1 with reports), `chat_history` (FK `report_id`, `user_id`, `session_id`)
  - CHECK constraints for email format, status enums, role enum
  - Indexes on every foreign key and frequently-queried column
- `config/migrate.js` — runs the schema (`npm run migrate`)
- `config/seed.js` — creates one test user for Postman (`npm run seed`)

### 3. Authentication System
- `controllers/authController.js` — register, login, refresh, logout
- `utils/jwt.js` — access token (short-lived) + refresh token (stored in `sessions` table, matching the ER diagram's USERS-has-SESSIONS relationship)
- Password encryption: bcrypt, 12 salt rounds (`authController.js`)
- `middleware/auth.js` — `requireAuth` (verifies JWT), `requireRole(...)` (role management, matches `users.role`)

### 4. Core API Development
| Method | Endpoint | File |
|---|---|---|
| POST | `/api/auth/register` | `routes/authRoutes.js` |
| POST | `/api/auth/login` | `routes/authRoutes.js` |
| POST | `/api/auth/refresh` | `routes/authRoutes.js` |
| POST | `/api/auth/logout` | `routes/authRoutes.js` |
| GET | `/api/profile` | `routes/userRoutes.js` |
| PUT | `/api/profile` | `routes/userRoutes.js` |
| POST | `/api/reports` | `routes/reportRoutes.js` |
| GET | `/api/reports` | `routes/reportRoutes.js` |
| GET | `/api/reports/:id` | `routes/reportRoutes.js` |
| DELETE | `/api/reports/:id` | `routes/reportRoutes.js` |
| GET | `/api/summaries/:reportId` | `routes/summaryRoutes.js` |
| POST | `/api/chat/:reportId` | `routes/chatRoutes.js` |
| GET | `/api/chat/:reportId/history` | `routes/chatRoutes.js` |

### 5. Database Connectivity
- `config/db.js` — connection pool, parameterized queries (`$1, $2...`), transaction helper
- `tests/checkDbConnectivity.js` — run with `npm run check-db`; verifies connection, required tables exist, and a real INSERT → SELECT → DELETE round-trip succeeds
- Every model file (`models/*.js`) goes through this same pool — no controller talks to the DB directly

### 6. Error Handling
- `utils/ApiError.js` — typed error with HTTP status code
- `middleware/errorHandler.js` — single global handler:
  - Maps Postgres error codes (unique violation, FK violation, not-null, bad UUID) to clean 4xx responses
  - Catches malformed JSON bodies
  - Catches JWT errors
  - Falls back to 500 for anything unexpected, without crashing the process
- `middleware/validators.js` — express-validator rules per endpoint; `validate` middleware turns failures into a 400 with field-level details
- `utils/asyncHandler.js` — every controller is wrapped so thrown/rejected errors always reach the handler above

### 7. API Testing
- `tests/MedInsight.postman_collection.json` — import into Postman or Thunder Client
  - **Auth**: register (success, validation error, duplicate email), login (success, wrong password, unknown email), refresh (success, invalid token), logout
  - **Profile**: get (success, no token, malformed token), update (success, validation error)
  - **Reports**: create (success, validation error, no auth), list, get by id (success, invalid UUID, not found), delete (success, already-deleted)
  - **Summaries**: get (not found, invalid UUID)
  - **Chat**: send message (success, empty message, report not found), get history
  - **Misc**: health check, unknown route, malformed JSON body
  - Collection variables auto-chain: register/login sets `access_token`, report creation sets `report_id`

## Setup

```bash
npm install
cp .env.example .env        # fill in DB credentials, JWT secrets, OPENAI_API_KEY
npm run migrate              # creates all 5 tables from schema.sql
npm run check-db              # verifies connectivity + read/write
npm run seed                  # optional: creates test@medinsight.dev / Test@1234
npm run dev                   # starts on :5000
```

Then import `tests/MedInsight.postman_collection.json` into Postman, set `base_url` if not `localhost:5000`, and run the collection top to bottom (folders are ordered so tokens chain correctly).

## Architecture

```
routes/        → defines endpoints + attaches validators/middleware
controllers/    → request/response handling, calls models, throws ApiError
models/         → all SQL lives here, parameterized, returns plain rows
middleware/     → auth, validation, error handling
utils/          → JWT helpers, ApiError, asyncHandler, AI integration
config/         → db pool, schema, migration, seed
tests/          → Postman collection + DB connectivity script
```
