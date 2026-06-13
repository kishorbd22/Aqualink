# AquaLink

Full-stack application platform built with modern technologies.

## Tech Stack

- **Backend:** Node.js, Express, Sequelize ORM, PostgreSQL
- **Frontend:** Next.js 14 (App Router), React 18
- **Database:** PostgreSQL 15
- **Cache / Queue:** Redis 7
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

## Project Structure

```
├── backend/                   # Backend API service
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models (Sequelize)
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic layer
│   │   ├── jobs/              # Scheduled tasks / background jobs
│   │   └── app.js             # Express entry point (port 5000)
│   ├── migrations/            # Database migrations
│   ├── tests/                 # Jest test suite
│   ├── Dockerfile             # Backend container config
│   └── package.json           # Backend dependencies
├── frontend/                  # Frontend application
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Pages Router fallback
│   ├── Dockerfile             # Frontend container config
│   └── package.json           # Frontend dependencies
├── docker-compose.yml         # Multi-container orchestration
├── .github/workflows/         # CI/CD pipeline
└── README.md                  # Project documentation
```

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (recommended for full-stack development)
- npm or yarn

## Getting Started

### Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev        # Starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:3000
```

> **Note:** For local development without Docker, you will need a running PostgreSQL instance and Redis instance, or configure the services accordingly.

### Docker Setup (recommended)

Run the entire stack (backend, frontend, PostgreSQL, Redis) with a single command:

```bash
docker compose up --build
```

This will start:
- **Backend API** on http://localhost:5000
- **Frontend** on http://localhost:3000
- **PostgreSQL** on port 5432
- **Redis** on port 6379

### Verify Setup

Once running, test the backend health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{ "status": "ok", "service": "Aqualink Backend" }
```

## Available Scripts

### Backend

| Script           | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start with nodemon (hot reload)    |
| `npm start`      | Start in production mode           |
| `npm test`       | Run Jest test suite                |
| `npm run lint`   | Run ESLint                         |
| `npm run migrate`| Run database migrations            |

### Frontend

| Script           | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start Next.js dev server           |
| `npm run build`  | Build for production               |
| `npm start`      | Start production server            |
| `npm run lint`   | Run Next.js lint                   |
| `npm test`       | Run Jest test suite                |

## CI/CD

Automated pipeline via GitHub Actions (`.github/workflows/ci.yml`):

- **Backend:** Lint + Test on every push/PR to `main`
- **Frontend:** Lint + Test on every push/PR to `main`
- **Docker:** Build verification after tests pass

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://aqualink:aqualink_secret@localhost:5432/aqualink
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## License

MIT