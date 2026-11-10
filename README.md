# AlgoMate

AlgoMate is a Next.js App Router project for coding contests, mentorship, student profiles, rewards, and platform administration.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

Application code lives under `src/`:

- `src/app/` contains public, authentication, student, mentor, admin, and contest-participation routes.
- `src/components/` contains shared UI, common layout, landing-page, and cross-feature components.
- `src/features/` contains domain types, services, hooks, and feature components.
- `src/lib/api/` contains the API transport client and typed endpoint bindings.
- `src/lib/auth/`, `src/lib/validations/`, `src/hooks/`, and `src/types/` contain shared application utilities.
- `src/services/mock/` contains the current landing-page seed data.
- `public/images/`, `public/icons/`, and `public/fonts/` are static asset locations.

`@/` resolves to `src/`. Root configuration files and `public/` remain at the repository root as required by Next.js.

## Backend integration status

The application uses Clerk for frontend sign-in and typed client contracts for the Express API. No code runner, payment/coin ledger, or feature CRUD API is configured here. Routes that depend on those services are scaffolds; they do not simulate trusted scoring, coin deductions, mentor approval, or admin permissions.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` for the deployment. Configure backend endpoints and OAuth secrets on the server; never expose provider secrets in `NEXT_PUBLIC_*` variables.

The independent Express/MongoDB backend lives in `backend/`. Follow [backend/README.md](./backend/README.md) to configure MongoDB Atlas and start it on port 5000. The backend currently provides the health endpoint and domain model/API foundations; it is not yet a replacement for the frontend demo flows.

Clerk auth is integrated across the Next.js frontend and Express API. Put `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in the frontend `.env.local`; keep `CLERK_SECRET_KEY` only in `backend/.env`, alongside `CLERK_PUBLISHABLE_KEY`. Enable desired sign-in providers in the Clerk Dashboard. The frontend sends Clerk session tokens as bearer tokens; the backend verifies them and syncs the signed-in user through `GET /api/auth/me`. Never share or commit either `.env` file.

## Checks

```bash
npm run lint
npm run build
```
