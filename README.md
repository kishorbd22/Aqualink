# 🐟 AquaLink

**AquaLink** is a full-stack marketplace platform connecting fish farmers, sellers, and buyers in a seamless digital ecosystem. It streamlines the listing, ordering, transaction, delivery, and review lifecycle — empowering aquaculture businesses with modern web technology.

With role-based dashboards (Admin, Farmer, Buyer), real-time notifications, and a RESTful API, AquaLink brings the fish trade online with security, scalability, and ease of use.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based user registration and login
- Role-based access control: **Admin**, **Farmer**, **Buyer**
- Protected routes with token validation middleware

### 📦 Listing Management
- Create, read, update, and delete fish listings
- Paginated, filterable listing queries with category, price range, location
- Image-ready schemas for product showcase

### 🛒 Order Management
- Place orders on listed fish products
- Track order statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- Buyer and seller order history views

### 💳 Transactions
- Record and track payments for orders
- Transaction status: `pending`, `completed`, `failed`, `refunded`
- Links orders to financial records

### 🚚 Delivery Management
- Assign delivery agents to orders
- Update delivery status: `pending`, `in_transit`, `delivered`, `failed`
- Full delivery audit trail for each order

### ⭐ Reviews & Ratings
- Buyers can rate and review completed orders
- Aggregated ratings per listing (average rating, total reviews)

### 🔔 Notifications
- In-app notifications for order updates, delivery changes, and account events
- Read/unread tracking with timestamps
- Role-specific notification feeds

### 📊 Dashboard Analytics
- Role-based dashboard endpoints (Admin, Farmer, Buyer)
- Key metrics: total orders, revenue, listing counts, delivery stats
- Revenue breakdown and trend data

### 🛡️ Security & Performance
- **Helmet** — HTTP security headers
- **CORS** — Configurable cross-origin access
- **Rate Limiting** — API request throttling
- **HPP** — HTTP parameter pollution protection
- **Compression** — Gzip response compression
- **Input Validation** — Joi schema validation middleware

---

## 🛠️ Tech Stack

| Layer          | Technology                                              |
|----------------|---------------------------------------------------------|
| **Backend**    | Node.js, Express, Sequelize ORM, PostgreSQL             |
| **Frontend**   | Next.js 14 (App Router), React 18                       |
| **Database**   | PostgreSQL 15                                           |
| **Cache**      | Redis 7 (queues / session cache)                        |
| **Auth**       | JSON Web Tokens (JWT), bcryptjs                         |
| **Validation** | Joi schemas                                             |
| **API Docs**   | Swagger / OpenAPI (swagger-jsdoc + swagger-ui-express)  |
| **Container**  | Docker & Docker Compose                                 |
| **CI/CD**      | GitHub Actions                                          |
| **Testing**    | Jest + Supertest                                        |

---

## 🏗️ Architecture

AquaLink follows a **layered architecture** separating concerns across the backend:

```
Client (Browser / API Consumer)
       │
       ▼
   ┌─────────────────────────────────────┐
   │         Next.js Frontend            │
   │   (App Router, SSR/CSR pages)       │
   └──────────────┬──────────────────────┘
                  │ HTTP / JSON
                  ▼
   ┌──────────────────────────────────────┐
   │         Express Backend API          │
   │                                      │
   │  Middleware Stack:                    │
   │  helmet → cors → rate-limit → hpp →  │
   │  compression → json parser           │
   │                                      │
   │  Routes → Controllers → Services →  │
   │  Models / Database                   │
   └──────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
   PostgreSQL            Redis
   (Primary DB)         (Cache / Queue)
```

### Design Decisions
- **Service Layer**: Business logic is isolated in `src/services/`, keeping controllers thin and testable.
- **Sequelize ORM**: Provides migration management, model relationships, and database abstraction.
- **Swagger API Docs**: Auto-generated from JSDoc annotations, available at `/api/docs`.
- **Environment-driven config**: All secrets and tunables are managed via environment variables.

---

## 📁 Folder Structure

```
Aqualink/
├── backend/                          # Backend API service
│   ├── src/
│   │   ├── controllers/              # Request handlers (thin layer)
│   │   ├── database/                 # Sequelize config, migrations
│   │   ├── docs/                     # Swagger/OpenAPI specification
│   │   ├── jobs/                     # Background / scheduled tasks
│   │   ├── middleware/               # Auth, validation, error handling
│   │   ├── models/                   # Sequelize ORM models
│   │   ├── routes/                   # Express route definitions
│   │   ├── services/                 # Business logic layer
│   │   ├── utils/                    # Helpers (pagination, errors)
│   │   └── app.js                    # Express application entry point
│   ├── tests/                        # Jest + Supertest test suite
│   │   ├── auth.test.js
│   │   ├── listing.test.js
│   │   ├── order.test.js
│   │   ├── transaction.test.js
│   │   ├── delivery.test.js
│   │   ├── notification.test.js
│   │   ├── review.test.js
│   │   ├── dashboard.test.js
│   │   ├── helpers.js
│   │   └── setup.js
│   ├── Dockerfile                    # Backend container image
│   └── package.json
│
├── frontend/                         # Frontend application
│   ├── app/                          # Next.js App Router pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── listings/
│   │   └── ...
│   ├── components/                   # Reusable React components
│   │   ├── Navbar.js
│   │   └── ListingCard.js
│   ├── lib/                          # API client, utilities
│   ├── Dockerfile                    # Frontend container image
│   └── package.json
│
├── docker-compose.yml                # Multi-container orchestration
├── .github/workflows/ci.yml          # GitHub Actions CI/CD pipeline
├── .gitignore
├── package.json                      # Root workspace config
└── README.md                         # You are here 📘
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **Docker & Docker Compose** (recommended for full-stack development)
- **PostgreSQL** 15+ (if running without Docker)
- **Redis** 7+ (if running without Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/kishorbd22/Aqualink.git
cd Aqualink
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your local database credentials (see [Environment Variables](#-environment-variables)).

### 4. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 5. Start Development Servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in `backend/` with the following:

```env
# ─── Server ──────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database (PostgreSQL) ───────────────────────
DATABASE_URL=postgresql://aqualink:aqualink_secret@localhost:5432/aqualink
DATABASE_URL_TEST=postgresql://aqualink:aqualink_secret@localhost:5432/aqualink_test

# ─── Cache / Queue (Redis) ───────────────────────
REDIS_URL=redis://localhost:6379

# ─── Frontend URL (CORS) ─────────────────────────
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# ─── JWT (Authentication) ────────────────────────
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# ─── Rate Limiting ───────────────────────────────
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX=100                # max 100 requests per window
RATE_LIMIT_TRUST_PROXY=true
```

---

## 🗄️ Database Setup

### Without Docker

1. **Install PostgreSQL** 15+ and create the database:

```sql
CREATE DATABASE aqualink;
CREATE USER aqualink WITH PASSWORD 'aqualink_secret';
GRANT ALL PRIVILEGES ON DATABASE aqualink TO aqualink;
```

2. **Run migrations**:

```bash
cd backend
npm run migrate
```

3. **To roll back**:

```bash
npm run migrate:down
```

4. **Check migration status**:

```bash
npm run migrate:status
```

### With Docker

PostgreSQL is automatically provisioned when you run `docker compose up`. See [Docker Setup](#-docker-setup).

---

## 🐳 Docker Setup

Run the entire stack (backend, frontend, PostgreSQL, Redis) with a single command:

```bash
# From the project root
docker compose up --build
```

This starts:

| Service     | Port    | URL                        |
|-------------|---------|----------------------------|
| Backend API | `5000`  | http://localhost:5000       |
| Frontend    | `3000`  | http://localhost:3000       |
| PostgreSQL  | `5432`  | `localhost:5432`            |
| Redis       | `6379`  | `localhost:6379`            |

**Verify everything is running:**

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{ "status": "ok", "service": "Aqualink Backend" }
```

**To stop:**

```bash
docker compose down
```

---

## 📖 API Documentation

Interactive API documentation is available via Swagger UI when the backend is running:

> **http://localhost:5000/api/docs**

### API Endpoints Overview

| Method | Endpoint                         | Description                    | Auth Required |
|--------|----------------------------------|--------------------------------|---------------|
| GET    | `/api/health`                    | Health check                   | ❌            |
| POST   | `/api/auth/register`             | Register a new user            | ❌            |
| POST   | `/api/auth/login`                | Login and receive JWT          | ❌            |
| GET    | `/api/auth/me`                   | Get current user profile       | ✅            |
| GET    | `/api/listings`                  | List all listings (paginated)  | ❌            |
| POST   | `/api/listings`                  | Create a new listing           | ✅ (Farmer)   |
| GET    | `/api/listings/:id`              | Get listing by ID              | ❌            |
| PUT    | `/api/listings/:id`              | Update listing                 | ✅ (Owner)    |
| DELETE | `/api/listings/:id`              | Delete listing                 | ✅ (Owner)    |
| GET    | `/api/orders`                    | List user's orders             | ✅            |
| POST   | `/api/orders`                    | Place a new order              | ✅ (Buyer)    |
| GET    | `/api/orders/:id`                | Get order details              | ✅            |
| PUT    | `/api/orders/:id/status`         | Update order status            | ✅            |
| GET    | `/api/transactions`              | List transactions              | ✅            |
| POST   | `/api/transactions`              | Create a transaction           | ✅            |
| GET    | `/api/deliveries`                | List deliveries                | ✅            |
| POST   | `/api/deliveries`                | Create a delivery              | ✅ (Admin)    |
| PUT    | `/api/deliveries/:id/status`     | Update delivery status         | ✅ (Agent)    |
| GET    | `/api/notifications`             | List user notifications        | ✅            |
| PUT    | `/api/notifications/:id/read`    | Mark notification as read      | ✅            |
| GET    | `/api/reviews`                   | List reviews (by listing/user) | ❌            |
| POST   | `/api/reviews`                   | Submit a review                | ✅ (Buyer)    |
| GET    | `/api/dashboard/admin`           | Admin dashboard analytics      | ✅ (Admin)    |
| GET    | `/api/dashboard/farmer`          | Farmer dashboard analytics     | ✅ (Farmer)   |
| GET    | `/api/dashboard/buyer`           | Buyer dashboard analytics      | ✅ (Buyer)    |

---

## 🔄 Example Requests

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "password": "securePass123",
    "role": "farmer"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "farmer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "name": "John Farmer", "email": "john@example.com", "role": "farmer" }
  }
}
```

### 3. Create a Listing (Authenticated)

```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Fresh Tilapia",
    "description": "Farm-raised tilapia, 500g–1kg each",
    "category": "freshwater",
    "price": 250.00,
    "unit": "kg",
    "quantity": 100,
    "location": "Kerala, India"
  }'
```

### 4. Place an Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "listingId": 1,
    "quantity": 5,
    "deliveryAddress": "Cochin, Kerala"
  }'
```

### 5. Check API Health

```bash
curl http://localhost:5000/api/health
```

---

## 🧪 Testing

### Backend Tests

Tests use **Jest** + **Supertest** for HTTP integration testing. The test suite covers all API endpoints including authentication, listings, orders, transactions, deliveries, notifications, reviews, and dashboards.

```bash
cd backend

# Run full test suite with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report only
npm run test:coverage
```

Test configuration:
- **Test timeout**: 30 seconds
- **Environment**: Node (no browser)
- **Coverage**: Collected from `src/**/*.js` (excludes `app.js`, `database/`, `docs/`, `jobs/`)
- **Setup file**: `tests/setup.js` — runs before all tests

### Test Files

| File                    | Description                        |
|-------------------------|------------------------------------|
| `tests/auth.test.js`    | Registration, login, profile       |
| `tests/listing.test.js` | CRUD operations for listings       |
| `tests/order.test.js`   | Order placement and status updates |
| `tests/transaction.test.js` | Transaction lifecycle          |
| `tests/delivery.test.js` | Delivery creation and tracking    |
| `tests/notification.test.js` | Notification CRUD             |
| `tests/review.test.js`  | Review submission and retrieval    |
| `tests/dashboard.test.js` | Role-based analytics endpoints   |
| `tests/helpers.js`      | Shared test utilities              |
| `tests/setup.js`        | Global test setup                  |

---

## 🌍 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run in production mode
docker compose up --build -d
```

### Manual Deployment

**Backend:**

```bash
cd backend
NODE_ENV=production npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push/PR to `main`:

1. **Backend**: Lint → Test → Build Docker image
2. **Frontend**: Lint → Test → Build Docker image
3. **Security**: Runs on `ubuntu-latest` with PostgreSQL service container

### Environment Variables for Production

Ensure these variables are configured in your production environment:

| Variable               | Production Value                       |
|------------------------|----------------------------------------|
| `NODE_ENV`             | `production`                           |
| `DATABASE_URL`         | Production PostgreSQL connection string |
| `REDIS_URL`            | Production Redis connection string     |
| `JWT_SECRET`           | A strong, random secret key            |
| `FRONTEND_URL`         | Your deployed frontend URL             |
| `CORS_ORIGIN`          | Your deployed frontend URL             |
| `RATE_LIMIT_MAX`       | Adjust based on traffic expectations   |

---

## 📸 Screenshots

> 🖼️ *Screenshots coming soon.*

| Page              | Preview |
|-------------------|---------|
| Home Page         | —       |
| Login / Register  | —       |
| Listings Grid     | —       |
| Order Details     | —       |
| Dashboard (Admin) | —       |
| Dashboard (Farmer)| —       |
| Dashboard (Buyer) | —       |

---

## 🧭 Future Roadmap

- [x] **User Authentication & Role Management** — JWT-based auth with Admin/Farmer/Buyer roles
- [x] **Listing CRUD** — Full product listing management with pagination
- [x] **Order Lifecycle** — Placement, status tracking, history
- [x] **Transaction Recording** — Payment tracking per order
- [x] **Delivery Tracking** — Assignment and status updates
- [x] **Reviews & Ratings** — Buyer feedback system
- [x] **Notifications** — In-app alert system
- [x] **Dashboard Analytics** — Role-based metrics and insights
- [x] **API Documentation** — Swagger UI at `/api/docs`
- [ ] **Payment Gateway Integration** — Razorpay / Stripe
- [ ] **Real-time Notifications** — WebSocket (Socket.IO) support
- [ ] **Image Upload** — Product images for listings
- [ ] **Search & Filter** — Full-text search across listings
- [ ] **Mobile App** — React Native / Flutter companion app
- [ ] **Admin Panel** — Extended admin management UI
- [ ] **Multi-language Support** — i18n for international markets
- [ ] **Email Notifications** — Transactional emails (resend / nodemailer)
- [ ] **Export / Reporting** — CSV/PDF export for orders and analytics

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/kishorbd22">Kishor B D</a>
</p>