# Relocation Engine — Client Tracker

A simple, Amazon-order-style progress tracker for clients who are already
working with Paulin. Each client gets a private link (no login needed) that
shows which step of the relocation they're on and what happens next. Paulin
(or media) updates each client's step from a password-protected admin panel.

## Pages

- `/admin` — list of clients, password-protected (see `ADMIN_PASSWORD` below).
- `/admin/clients/new` — add a client, generates their tracker link.
- `/admin/clients/[id]` — set the client's current stage, add a custom
  "what's happening right now" note, upload/manage documents, copy their
  tracker link, or delete them.
- `/track/[token]` — the client-facing tracker page. No login required —
  send this link via your existing SMS/email automation.

The stages are defined in `src/lib/stages.ts`. Edit that file to change the
wording or add/remove steps — every client's progress automatically follows
the new list.

## Local development

Requires a Postgres database (this app uses Postgres both locally and in
production — no SQLite). Point `DATABASE_URL` at any Postgres instance
(a local install, or a free hosted one like Neon/Supabase).

```bash
npm install               # also runs `prisma generate` automatically
cp .env.example .env      # fill in DATABASE_URL and the other vars below
npx prisma migrate dev    # first time only, creates the tables
npm run dev
```

Open http://localhost:3000 — it redirects to `/admin`.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Postgres connection string.
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token, used for per-client
  document uploads (contracts, IDs, closing paperwork, etc.).
- `ADMIN_PASSWORD` — shared password Paulin/media use to sign into `/admin`.
- `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_AGENT_NAME`, `NEXT_PUBLIC_AGENT_PHONE`
  — shown on the client tracker page's contact card (text/call buttons).

## Documents

Each client can have documents uploaded from their admin detail page. Every
document defaults to admin-only; toggling "Visible to client" also shows it
on that client's `/track/[token]` page for them to download. Files are
stored in Vercel Blob at a public-but-unguessable URL (same security model
as the tracker links themselves) — anyone who can view/manage documents in
the admin panel is trusted the same way they're trusted with everything else
there.

## Deploying

1. Provision a Postgres database (e.g. via your host's marketplace/storage
   tab — Vercel's Postgres integrations are Neon-backed) and set
   `DATABASE_URL` to its connection string in your host's environment settings.
2. Provision a Blob store the same way (Storage tab -> Create Database ->
   Blob) and set `BLOB_READ_WRITE_TOKEN`.
3. Set `ADMIN_PASSWORD` and the agent contact env vars there too.
4. Run `npx prisma migrate deploy` against the production database (or let
   your host run it as part of the build/deploy step).
