# Community Events Board

A small app where an admin posts local events and visitors browse them.
Built with Next.js (App Router) for an assignment.

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
  login/ signup/   auth pages
  admin/           admin pages (protected by middleware)
components/        AuthForm, LogoutButton
lib/
  db.js            cached MongoDB connection
  jwt.js           sign/verify tokens (also used by middleware)
  auth.js          password hashing, cookie helper, requireUser
  api.js           JSON error helper and route wrapper
  models/          User, Event
scripts/seed.js    sample data and admin user
middleware.js      protects /admin pages
```

## Answers
**3. How do you store passwords and protect the admin pages and APIs?**
Passwords are hashed with bcrypt (10 rounds) before saving, so the real password is never stored, and the hash is hidden from normal queries. Login returns a JWT signed with a secret from `.env`, set as an httpOnly cookie for the web and also accepted as a Bearer token for mobile. Admin pages are protected by Next.js middleware that checks the token and the admin role. Every admin API also calls `requireUser(req, "admin")` on the server, so skipping the UI doesn't bypass it.

## What's left
Admin event management (add event, Active/Inactive), the visitor events page with filters and pagination, favourite categories and My Feed, "Remind me", the event card designer, and the remaining README answers.

## Where I used AI tools
- Project planning, setup guidance and Day 1 code (DB helper, models, seed script, auth API, middleware, login/signup pages): Claude (Anthropic)