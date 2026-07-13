# Walkthrough — Milestone 10 — Production & DevOps

We have successfully configured and verified the DevOps & Production environment setup for **InternFlow**.

---

## 🛠️ Changes Implemented

### 1. Environment Variable Management
- Created [env.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/src/config/env.ts) to define and validate required environment variables using **Zod**:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `JWT_SECRET` (For signing session tokens)
  - `GEMINI_API_KEY` (Required for AI features)
  - `RESEND_API_KEY` (For sending transactional emails)
  - `NODE_ENV` (development/test/production)
- Included a `SKIP_ENV_VALIDATION` bypass, enabling static builds (e.g. Next.js bundling) to succeed without requiring secret API keys during compile-time.
- Updated imports in [db.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/lib/db.ts), [auth.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/lib/auth.ts), [email.service.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/lib/services/email.service.ts), and [client.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/lib/ai/client.ts) to import variables from `@/src/config/env`.
- Cleaned up the deprecated `config` folder from the project root.

### 2. Next.js 16 Proxy Middleware Update
- Next.js 16 deprecated `middleware.ts` in favor of the new `proxy.ts` convention.
- Updated [proxy.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/proxy.ts) to permit unauthenticated traffic to `/api/health` so that load balancers and system monitors can ping the server without authentication tokens.

### 3. Docker Configuration
- Created a production-ready [Dockerfile](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/Dockerfile) that packages the app, installs `postgresql-client` (for checking database readiness), runs `prisma generate`, and builds the optimized Next.js server.
- Created [docker-compose.yml](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/docker-compose.yml) exposing:
  - **Next.js app**: `http://localhost:3000`
  - **PostgreSQL**: `localhost:5432`
  - **Redis Cache**: `localhost:6379`
  - **pgAdmin Console**: `http://localhost:5050` (Username: `admin@internflow.com`, Password: `adminpassword`)
- Implemented dependency checks using `pg_isready` inside the Next.js container, running migrations (`npx prisma db push`) and data seeding (`node scripts/seed.js`) automatically on first startup.

### 4. GitHub Actions CI/CD Pipeline
- Added [.github/workflows/ci.yml](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/.github/workflows/ci.yml) with steps:
  - Check out code
  - Setup Node.js v20
  - Install dependencies (`npm ci`)
  - Run Prisma Client generation
  - Lint check (`npm run lint`)
  - Type check (`npm run typecheck`)
  - Run Tests (`npm run test`)
  - Build application (`npm run build` with `SKIP_ENV_VALIDATION=true`)

### 5. API Health Endpoint
- Implemented [route.ts](file:///c:/Users/sohai/OneDrive/Desktop/work/internflow/app/api/health/route.ts) exposing `/api/health`.
- Runs a dynamic query (`SELECT 1`) on every call to verify active database health.

---

## 🔍 Validation & Verification Results

### 1. Code Quality checks
- **Linting**: Passed `npm run lint` with `0` errors.
- **Type Checking**: Passed `npm run typecheck` successfully.
- **Production Build**: Successfully compiled Next.js using `npm run build`.

### 2. Docker compose verification
Started all containers with `docker compose up --build -d`.
- **Database Seeding**: Verified from logs that existing records are cleaned up and sample accounts are seeded:
  ```
  Sample Accounts to use (Password is 'password123'):
  Student:   jane@example.com  - Jane Doe
  Company:   techcorp@example.com
  ```
- **Health check route test**:
  ```bash
  curl http://localhost:3000/api/health
  ```
  Response:
  ```json
  {
      "status": "healthy",
      "database": "connected",
      "timestamp": "2026-07-13T12:28:13.473Z"
  }
  ```

---

## 🚀 Production Deployment Guide

When migrating from Docker to production cloud hosting, use the following guidelines:

### 1. Frontend: Vercel
1. Connect your GitHub repository to Vercel.
2. Select **Next.js** as the framework preset.
3. Configure the following **Environment Variables**:
   - `DATABASE_URL`: *[Your Production Postgres Connection URL]*
   - `JWT_SECRET`: *[A long secure random string]*
   - `GEMINI_API_KEY`: *[Your Google Gemini API Key]*
   - `RESEND_API_KEY`: *[Your Resend API Key]*
4. Click **Deploy**. Vercel handles SSL, CDN caching, and edge routing automatically.

### 2. Database: Neon or Supabase
- **Neon PostgreSQL**: Sign up at [neon.tech](https://neon.tech), spin up a serverless PostgreSQL database, and copy the connection string. In Neon, select **Pooled connection string** (usually contains `-pooler` in the host) for serverless environments.
- **Supabase**: Create a project on [supabase.com](https://supabase.com), retrieve the PostgreSQL connection string from Database settings (port 5432 / 6543 for pooling).
- **Syncing schema**: Run the following command from your local machine to apply the schema to the remote database:
  ```bash
  DATABASE_URL="your-production-db-url" npx prisma db push
  ```

### 3. File Storage: Cloudinary
1. Sign up for a free account at [cloudinary.com](https://cloudinary.com).
2. Retrieve your **Cloud Name**, **API Key**, and **API Secret**.
3. Integrate upload logic using the Cloudinary Node SDK or upload widget for resume and profile picture uploads.

### 4. Emails: Resend
1. Sign up at [resend.com](https://resend.com).
2. Add and verify your custom domain in the Resend dashboard.
3. Copy your API Key and assign it to `RESEND_API_KEY`.
