# Community Events Board

A small app where an admin posts local events and visitors browse them.
Built with Next.js (App Router) for an assignment.

## Tech stack
- Next.js 15 (App Router, JavaScript)
- Tailwind CSS
- MongoDB with Mongoose

## Prerequisites
- Node.js 20.9 or higher
- Docker Desktop **or** a free MongoDB Atlas account

## Setup
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
   - **Docker:** `docker compose up -d`
   - **Atlas:** put your connection string in `MONGODB_URI` in `.env.local`
4. Start the app:
```bash
   npm run dev
```
5. Open http://localhost:3000

## Where I used AI tools
- Project planning and initial setup guidance: Claude (Anthropic)