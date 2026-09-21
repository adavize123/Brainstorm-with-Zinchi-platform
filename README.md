# Brainstorm with Zinchi

A learning-management platform for Zinchi International: a public marketing site plus
role-based dashboards for **students**, **prospectors** (staff who manage students and
content), and **admins**. See [IMPLEMENTATION_SPEC.txt](./IMPLEMENTATION_SPEC.txt) for the
full architecture, schema, and workflow specification.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix) · Framer Motion ·
Prisma (SQLite locally, PostgreSQL/Supabase in production) · NextAuth.js (credentials)

## Getting started

```bash
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db and applies the schema
npx prisma db seed                   # seeds demo accounts and sample content
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role       | Email                     | Password      |
|------------|---------------------------|---------------|
| Admin      | admin@zinchi.org          | Admin123!     |
| Prospector | prospector@zinchi.org     | Prospect123!  |
| Student    | student@zinchi.org        | Student123!   |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the project
- `npx prisma studio` — browse the local database
- `npx prisma db seed` — re-run the seed script (idempotent)

## Moving to PostgreSQL / Supabase for production

1. In `prisma/schema.prisma`, change the `datasource db` `provider` from `"sqlite"` to
   `"postgresql"`.
2. Set `DATABASE_URL` in `.env` (or your host's environment variables) to your
   Supabase/Neon connection string.
3. Run `npx prisma migrate dev --name init` again to generate a Postgres-compatible
   migration, then `npx prisma migrate deploy` in your deployment pipeline.

## Project structure

```text
src/
  app/
    (marketing)/        Public site: home, courses, about, testimonials, faq, contact, apply
    (auth)/              Login / register
    student/             Student dashboard
    prospector/          Prospector dashboard
    admin/               Admin dashboard
    api/                 Route handlers (NextAuth, registration)
    actions/             Server Actions (all data mutations, role-checked)
  components/
    ui/                  shadcn/ui primitives
    marketing/           Landing page sections
    dashboard/           Shared dashboard shell + widgets
    student/             Student-only interactive components (exam taker, etc.)
  lib/                   auth, prisma client, validators, nav config, utils
prisma/
  schema.prisma
  seed.ts
```
