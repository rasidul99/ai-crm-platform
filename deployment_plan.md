# Deployment Preparation Plan

This document outlines the steps to prepare the AI Lead Generation CRM for production deployment.

## 1. Database (Supabase)
We will use Supabase as the managed PostgreSQL provider.
- **Action:** Create a new project in Supabase.
- **Action:** Get the **Transaction Connection Pooler String** (e.g., `postgres://postgres.[project]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`).
- **Note:** Append `?pgbouncer=true` to the connection string for serverless environments if using the pooler, or direct connection if using persistent servers like Render. For Prisma, efficient connection pooling is handled best if we use the direct connection string for migration and the pooler for the app, but for simplicity on Render (which is a long-running server), the direct connection is often fine.
- **Variable**: `DATABASE_URL`

## 2. Backend (Render)
We will deploy the Node.js/Express backend to Render Web Services.

### Code Changes Required
1.  **CORS Configuration**: Update `src/index.ts` to accept requests from the production frontend.
    ```typescript
    // backend/src/index.ts
    const allowedOrigins = [
        'http://localhost:3000', 
        'http://localhost:3001', 
        process.env.FRONTEND_URL || '' 
    ];
    
    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    ```
2.  **Build Config**:
    -   **Build Command**: `npm install && npx prisma generate && npm run build`
    -   **Start Command**: `npm start`

### Environment Variables (Render Dashboard)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Connection String | `postgresql://...` |
| `FRONTEND_URL` | URL of your Vercel App | `https://ai-crm-frontend.vercel.app` |
| `GEMINI_API_KEY` | (Optional) Fallback key | `...` |
| `NODE_ENV` | Environment mode | `production` |

## 3. Frontend (Vercel)
We will deploy the Next.js frontend to Vercel.

### Code Changes Required
1.  **API Configuration**: Ensure `lib/api.ts` uses an environment variable for the backend URL.
    ```typescript
    // frontend/lib/api.ts
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    ```

### Environment Variables (Vercel Dashboard)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of your Render Backend | `https://ai-crm-backend.onrender.com/api` |

## 4. Deployment Steps Sequence
1.  **Push Code**: exact `main` branch to GitHub.
2.  **Deploy Backend (Render)**:
    -   Connect GitHub repo.
    -   Set Root Directory to `backend`.
    -   Add `DATABASE_URL`.
    -   Deploy. **Save the Render URL**.
3.  **Deploy Frontend (Vercel)**:
    -   Connect GitHub repo.
    -   Set Root Directory to `frontend`.
    -   Add `NEXT_PUBLIC_API_URL` (The Render URL + `/api`).
    -   Deploy. **Save the Vercel URL**.
4.  **Finalize Backend**:
    -   Go back to Render.
    -   Add `FRONTEND_URL` (The Vercel URL) to environment variables.
    -   Redeploy to apply CORS changes.
