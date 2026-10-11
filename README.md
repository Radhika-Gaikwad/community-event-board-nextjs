# Community Events Board

A small app where an admin posts local events and visitors browse them.
Built with Next.js (App Router) for an assignment. Day 1 authentication and Day 2 event management/listing are implemented.

## Tech stack
- Next.js 15 (App Router, JavaScript)
- Tailwind CSS
- MongoDB with Mongoose
- JWT (`jose`) and `bcryptjs` for authentication

## Prerequisites
- Node.js 20.9 or higher
- Docker Desktop **or** a free MongoDB Atlas account

## Setup (about 5 minutes)
1. Clone the repo and install packages:
```bash
   git clone <repo-url>
   cd events-board
   npm install
```
2. Create your environment file:
```bash
   cp .env.example .env.local
```
3. Start MongoDB, using either option:
   - **Docker:** `docker compose up -d` (the default `MONGODB_URI` already points to it)
   - **Atlas:** put your connection string in `MONGODB_URI` in `.env.local`
4. Set a secret for login tokens. Generate one and paste it as `JWT_SECRET` in `.env.local`:
```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
5. Add sample data (15 events and the admin user), then start the app:
```bash
   npm run seed
   npm run dev
```
6. Open http://localhost:3000

## Environment variables
| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `ADMIN_EMAIL` | Email of the admin created by `npm run seed` |
| `ADMIN_PASSWORD` | Password of the admin created by `npm run seed` |

## Admin login
- URL: http://localhost:3000/login
- Email: `admin@example.com`
- Password: `Admin@123`

These come from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` when you run `npm run seed`.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start the app in development mode |
| `npm run seed` | Reset events to 15 sample events and create/update the admin user |
| `npm run build` / `npm start` | Production build and start |

Sample data: 9 active upcoming events, 3 inactive, and 3 past, across 5 cities and all 5 categories. Event dates are relative to the day you run the seed, so there are always upcoming events.

## API list
All responses are JSON. Errors look like `{ "error": "message" }`.
Auth works with an httpOnly cookie (web) or an `Authorization: Bearer <token>` header (mobile).

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | none | Create an account. Returns `{ token, user }` |
| POST | `/api/auth/login` | none | Log in. Returns `{ token, user }` |
| POST | `/api/auth/logout` | none | Clears the login cookie |
| GET | `/api/auth/me` | logged in | Returns the current user |
| GET | `/api/events` | none | List active upcoming events, nearest first; supports `category`, `city`, `q`, `page`, and `limit` together |
| POST | `/api/events` | admin | Create an event |
| PATCH | `/api/events/:id/status` | admin | Set `isActive` to `true` or `false`; events are not deleted |
| GET | `/api/admin/events` | admin | List and search all events; supports `q`, `status`, `sort`, `order`, `page`, and `limit` |
| GET | `/api/cities` | none | List cities with active upcoming events for the filter dropdown |

Example:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

## Project structure
```
app/
  api/auth/        signup, login, logout, me
   api/events/      public list, admin create, status update
   api/admin/       searchable, sortable, paginated admin event list
   api/cities/      public event cities
  login/ signup/   auth pages
   admin/           event table and add-event page (middleware protected)
components/        auth, event browser/cards, admin table, event form, states
lib/
  db.js            cached MongoDB connection
  jwt.js           sign/verify tokens (also used by middleware)
  auth.js          password hashing, cookie helper, requireUser
  api.js           JSON error helper and route wrapper
   events.js        event validation and API serialization
   format.js        Indian currency and friendly event dates
  models/          User, Event
scripts/seed.js    sample data and admin user
middleware.js      protects /admin pages
```

## Short answers
**How are passwords stored and admin pages/APIs protected?**
Passwords are hashed with bcrypt (10 rounds) before saving, so the real password is never stored, and the hash is hidden from normal queries. Login returns a JWT signed with a secret from `.env`, set as an httpOnly cookie for the web and also accepted as a Bearer token for mobile. Admin pages are checked by middleware, and each admin API checks the user's role with `requireUser(req, "admin")` on the server.

**How do the event filters work together?**
The public events API combines category, city, and text search in one database filter, returning only active upcoming events in date order. The admin list has URL-backed search, status filtering, sortable columns, and pagination, with five rows per page by default. Its responsive add form groups fields, marks required values, scrolls internally with fixed save actions, and confirms creation with a toast while showing the new event first.

**Where were AI tools used?**
Claude (Anthropic) was used for project planning and initial Day 1 setup/auth guidance. GitHub Copilot was used during Day 2 to help implement and review the event APIs, admin and visitor pages, filters, and pagination, and to update auth feedback and documentation. I reviewed and tested the generated changes and can explain the submitted code.

## What's left
- Day 3: favourite-category preferences, My Feed, and Remind me persistence.
- Day 4: event card themes, stickers, live preview, and saved design.
- Day 5/submission: complete remaining polish and record the 3–4 minute phone/laptop walkthrough with a short explanation of code choices.

Day 1–2 implementation is committed and pushed to `main`. The admin email/password above are seed defaults; change them in `.env.local` for a private deployment.