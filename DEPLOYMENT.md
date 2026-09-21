# Deployment Guide — Brainstorm with Zinchi

This app is code-complete and build-verified. What's left is entirely yours to decide:
**which host** and **which production database**. This document gives you the exact steps for
either path. Nothing here has been run against a live host or database — treat every command
below as something you run yourself.

--------------------------------------------------------------------------------
## 0. Before you push anywhere

Your git repository root was detected as your entire Windows user profile folder
(`C:\Users\Abdallah PC`), not this project directory. That means a `git add` from the repo root
could stage unrelated personal files from elsewhere in your profile. Before your first push:

```bash
cd "C:\Users\Abdallah PC\OneDrive\Desktop\zinchi-fullstack"
git status        # confirm what's actually staged/tracked
```

If you want this project in its own repository (recommended), initialize one scoped to just this
folder instead of relying on the profile-wide repo:

```bash
# from inside zinchi-fullstack/ — do this only if you want a project-local repo
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

--------------------------------------------------------------------------------
## 1. Required environment variables

Set these on whatever host you choose (never commit real values — `.env` is gitignored):

| Variable          | Example                                  | Notes                                              |
|-------------------|-------------------------------------------|-----------------------------------------------------|
| `DATABASE_URL`    | `postgresql://user:pass@host:5432/db`     | See section 3 — SQLite locally, Postgres in prod    |
| `NEXTAUTH_SECRET` | (random 32+ byte string)                  | Generate with `openssl rand -base64 32`             |
| `NEXTAUTH_URL`    | `https://your-production-domain.com`      | Must match the deployed URL exactly (https, no trailing slash) |

--------------------------------------------------------------------------------
## 2. Pre-flight checks (run these locally before deploying)

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # next build — must finish with no errors
```

All three currently pass cleanly against this codebase.

--------------------------------------------------------------------------------
## 3. Database: switching from local SQLite to production Postgres

Local development uses SQLite (`prisma/schema.prisma` → `provider = "sqlite"`) for a zero-config
setup. **Before deploying anywhere with an ephemeral or serverless filesystem (Vercel, most
container platforms), you must switch to Postgres** — SQLite's single file won't survive restarts
or be shared across instances there.

1. Provision a Postgres database (Supabase, Neon, Railway Postgres, RDS, etc.) and copy its
   connection string.
2. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "sqlite"        // change to "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` locally to the Postgres string and regenerate the migration history for
   Postgres (SQLite and Postgres migrations aren't interchangeable):
   ```bash
   rm -rf prisma/migrations
   npx prisma migrate dev --name init
   ```
4. Commit the new `prisma/migrations/` folder (Postgres-flavored SQL) to your repo.
5. In production, run migrations non-interactively instead of `migrate dev`:
   ```bash
   npx prisma migrate deploy
   # or: npm run prisma:migrate:deploy
   ```
6. Optionally seed demo content (only if you actually want the demo accounts in production —
   otherwise skip this and create real admin/prospector accounts by hand):
   ```bash
   npx prisma db seed
   ```

**If you'd rather keep SQLite**, deploy to a host with a persistent volume (Railway, Render, Fly.io,
a VPS) and mount a volume at the SQLite file's path so it survives restarts — no schema change
needed, but you lose the ability to run multiple instances safely.

--------------------------------------------------------------------------------
## 4. Hosting options

### Option A — Vercel (simplest, needs Postgres per section 3)
1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel; it auto-detects Next.js.
3. Add the three env vars from section 1.
4. Set the build command to `npm run build` (default) — `postinstall` already runs
   `prisma generate` automatically.
5. Run `npx prisma migrate deploy` against your production `DATABASE_URL` once, either from your
   machine or a one-off Vercel deploy hook, before the first real deploy.

### Option B — Railway / Render / Fly.io (supports persistent disk, so SQLite works too)
1. Connect the repo.
2. Build command: `npm install && npm run build`. Start command: `npm run start` (or
   `node .next/standalone/server.js` since `output: "standalone"` is enabled).
3. Add env vars from section 1. If keeping SQLite, mount a persistent volume and point
   `DATABASE_URL` at a file path on that volume (e.g. `file:/data/prod.db`).
4. If using that platform's managed Postgres instead, follow section 3.

### Option C — Docker / self-hosted
`output: "standalone"` is already enabled in `next.config.mjs`, so `next build` produces a
minimal, self-contained server at `.next/standalone/server.js` with only the dependencies it
actually needs. A minimal Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

Run `npx prisma migrate deploy` as a separate step (entrypoint script or CI job) before starting
the container, since the standalone server doesn't run migrations itself.

--------------------------------------------------------------------------------
## 5. Post-deploy checklist

- [ ] Visit `/api/health` — should return `{"status":"ok","db":"connected"}`
- [ ] Log in as each role once real accounts exist; confirm dashboards load
- [ ] If you seeded demo accounts for a public deployment, either delete them or change their
      passwords — `admin@zinchi.org` / `Admin123!` etc. are public knowledge (they're in this repo's
      README)
- [ ] Update `metadataBase` in `src/app/layout.tsx` and the hardcoded domain in
      `src/app/sitemap.ts` / `src/app/robots.ts` if your final domain isn't
      `brainstorm.zinchi.org`
- [ ] Confirm `NEXTAUTH_URL` exactly matches the deployed domain (mismatches break login redirects
      and cookie security)
- [ ] Set a real `.env` on the host — never the committed `.env.example` values

--------------------------------------------------------------------------------
## 6. What's intentionally out of scope

These are reasonable next steps but weren't built, since they weren't asked for and would expand
scope beyond "get the current app ready to deploy":

- Rate limiting on auth/enquiry endpoints
- Email delivery (credential emails, deadline reminders) — see IMPLEMENTATION_SPEC.txt §6
- File uploads for materials/submissions (currently URL/text-based)
- A CI pipeline (GitHub Actions running typecheck/lint/build on PRs)
