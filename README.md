# Relocation Engine — Client Tracker

A simple, Amazon-order-style progress tracker for clients who are already
working with Paulin. Each client gets a private link (no login needed) that
shows which step of the relocation they're on and what happens next. Paulin
(or media) updates each client's step from a password-protected admin panel.

## Pages

- `/admin` — list of clients, password-protected (see `ADMIN_PASSWORD` below).
- `/admin/clients/new` — add a client, generates their tracker link.
- `/admin/clients/[id]` — set the client's current stage, add a custom
  "what's happening right now" note, copy their tracker link, or delete them.
- `/track/[token]` — the client-facing tracker page. No login required —
  send this link via your existing SMS/email automation.

The stages are defined in `src/lib/stages.ts`. Edit that file to change the
wording or add/remove steps — every client's progress automatically follows
the new list.

## Local development

```bash
npm install
npx prisma migrate dev   # first time only, creates the local SQLite db
npm run dev
```

Open http://localhost:3000 — it redirects to `/admin`.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — SQLite file for local dev. Swap for a hosted Postgres URL
  in production (see below).
- `ADMIN_PASSWORD` — shared password Paulin/media use to sign into `/admin`.
- `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_AGENT_NAME`, `NEXT_PUBLIC_AGENT_PHONE`
  — shown on the client tracker page's contact card (text/call buttons).

## Deploying

This uses SQLite locally, which doesn't persist on most serverless hosts
(e.g. Vercel). Before deploying:

1. Swap the Prisma datasource/adapter for a hosted database (e.g. Postgres —
   `@prisma/adapter-pg` and a `postgresql` provider in `prisma/schema.prisma`).
2. Set `ADMIN_PASSWORD` and the agent contact env vars in your host's
   environment settings.
3. Run `npx prisma migrate deploy` against the production database.
