# Community Events Board


## Demo video:
[Watch the walkthrough]:https://drive.google.com/file/d/1kgT-tO3ZwAu62GTJf6VwCTcmEhNuqtoq/view


## demo Url:(deployed)
https://community-event-board-nextjs-vp1l.vercel.app/


## Admin Credentials: (Dummy)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123



A small app where an admin posts local events and visitors browse them.
Built with Next.js (App Router) for an assignment. Days 1–4 cover authentication, event management, personalized feeds, reminders, and saved event-card designs.

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
2. Create your local environment file:
```bash
cp .env.example .env.local
```
3. Start MongoDB with Docker, or put your Atlas connection string in `MONGODB_URI` in `.env.local`:
```bash
docker compose up -d
```
4. Set `JWT_SECRET` to a long random value. You can generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
5. Seed the sample events/admin, start the app, then open http://localhost:3000:
```bash
npm run seed
npm run dev
```

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
| GET, PUT | `/api/favourites` | logged in | Read or replace the user's favourite event categories |
| GET | `/api/feed` | logged in | Paginated active upcoming events matching favourite categories |
| GET | `/api/events` | none | List active upcoming events, nearest first; supports `category`, `city`, `q`, `page`, and `limit` together |
| GET | `/api/events/:id` | none | Get an active upcoming event for its detail page |
| GET, PUT | `/api/events/:id/reminder` | logged in | Read or save the user's reminder for an upcoming event |
| GET, PUT | `/api/events/:id/card` | logged in | Read or save the user's card theme and stickers for an event |
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
   api/events/      public list, details, status, reminders, card designs
   api/favourites/  read and save category preferences
   api/feed/        upcoming events from favourite categories
   api/admin/       searchable, sortable, paginated admin event list
   api/cities/      public event cities
  login/ signup/   auth pages
   feed/            personalized upcoming events
   preferences/     favourite category settings
   events/[id]/     event detail page
   admin/           event table and add-event page (middleware protected)
components/        auth, event browser/cards, feed, preferences, reminders, admin tools, states
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
Claude (Anthropic) was used for project planning and initial Day 1 setup/auth guidance. GitHub Copilot was used during Days 2–4 to help implement and review event management, filtering, pagination, favourite preferences, My Feed, reminders, the event-card designer, responsive polish, and documentation. I reviewed and tested the generated changes and can explain the submitted code.

## What's left

The admin email/password above are seed defaults; change them in `.env.local` for a private deployment. Never commit `.env.local` or share its values.

7. If port 3000 is busy, Next.js starts on the next free port. Open the URL printed in the terminal.