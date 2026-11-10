# AlgoMate Backend

Independent Express, TypeScript, and MongoDB service. The server validates configuration and connects to MongoDB before opening its HTTP listener.

## Setup

1. Install a supported Node.js LTS release and npm.
2. Create a MongoDB Atlas cluster and database user. Give the user only the database permissions required by this service.
3. In Atlas **Network Access**, allow the development machine's current public IP. Avoid `0.0.0.0/0` except for temporary, controlled testing.
4. In Atlas **Database → Connect → Drivers**, copy the Node.js connection string. Replace `<password>` with the database user's password and select/append the database name, for example `algomate`. URL-encode special characters in the password.
5. In Clerk, create an application, enable the sign-in methods you want (such as Google), and copy its publishable and secret API keys. Use the same Clerk application for the Next.js frontend and this API. Set the desired auth methods in Clerk Dashboard; the app does not receive or store user passwords.
6. From `backend/`, copy `.env.example` to `.env` and set `MONGODB_URI`, `CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`. For Codespaces, set `FRONTEND_URL` to the actual frontend origin; multiple allowed origins can be comma-separated. Never commit `.env` or place secrets in `NEXT_PUBLIC_*` variables.
7. Install packages and run the development API:

```bash
cd backend
npm install
npm run dev
```

The API listens on port 5000 by default. `GET http://localhost:5000/api/health` returns `200` only when MongoDB is connected; otherwise it returns `503` with a structured database-unavailable response.

The Next.js frontend needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_API_URL=http://localhost:5000` in its root `.env.local`. Keep `CLERK_SECRET_KEY` only in `backend/.env`; never add it to a `NEXT_PUBLIC_*` variable or expose it to browser code.

`GET /api/auth/me` requires a Clerk session bearer token. It reads the verified Clerk identity, synchronizes its primary email/name/image to MongoDB, and creates a database user with the server-assigned `student` role on first sign-in. It never accepts a role from the request body. Admin/mentor roles must be granted by trusted backend administration. Protected frontend pages are gated by the Next.js Clerk proxy; API authorization must still be enforced on every backend route.

## Scripts

```bash
npm run dev    # TypeScript development server with reload
npm run build  # Compile src/ into dist/
npm start      # Run compiled production server
npm test       # Compile and run health/error handling tests
```

## Notes

- Clerk JWT verification is performed by `@clerk/express`; protected API routes use `getAuth()` only after `clerkMiddleware()`.
- `User.role` is not accepted by the onboarding/profile validators. A frontend-supplied role must never grant privileges.
- Coin balances must only be changed by trusted backend services and recorded with a coin transaction.
- Code submissions are stored as data only. Do not execute untrusted code inside this API process.
- The current API surface is the health endpoint; domain models, validation schemas, and authorization middleware are foundations for subsequent feature routes.
