# AI Lead Generation & Client Engagement Automation Platform

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- API Keys:
  - Gemini API
  - Vapi.ai API
  - Apify API

## Getting Started

1.  **Start Database & Redis**
    ```bash
    docker-compose up -d
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    npx prisma migrate dev
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Architecture
- **Frontend:** Next.js (Port 3000)
- **Backend:** Node.js/Express (Port 4000)
- **Database:** PostgreSQL (Port 5432)
- **Cache/Queue:** Redis (Port 6379)
