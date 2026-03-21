# BookStore

A full-stack e-commerce web application for browsing and purchasing books. It includes a customer-facing storefront, user accounts, shopping cart, checkout with online payments, order tracking, and admin tools for managing books, categories, offers, and users.

## What it does

- **Browse & search** — Home page with book listings, search, and book detail pages.
- **Shopping** — Cart (with optional special offers), checkout with delivery address and shipping options.
- **Payments** — Razorpay integration for placing and verifying orders.
- **Orders** — Order history, order details, cancellations and returns (where applicable).
- **Account** — User profile, saved addresses, wishlist, recently viewed books, and book reviews.
- **Authentication** — Email/password flow, Google OAuth, JWT-based sessions, password reset / email verification (where configured).
- **Administration** — Role-based areas for **admin** and **superadmin**: book and category management, special offers, order management, and user management.

## Tech stack

### Frontend (`/frontend`)

| Area | Technology |
|------|------------|
| UI | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| State | [Redux Toolkit](https://redux-toolkit.js.org/), [redux-persist](https://github.com/rt2zz/redux-persist) |
| HTTP | [Axios](https://axios-http.com/) |
| Notifications | [notistack](https://notistack.com/) |
| Auth (Google) | [@react-oauth/google](https://github.com/MomenSherif/react-oauth) |
| Other | [react-icons](https://react-icons.github.io/react-icons/), [jwt-decode](https://github.com/auth0/jwt-decode), [react-tooltip](https://react-tooltip.com/) |

### Backend (`/backend`)

| Area | Technology |
|------|------------|
| Runtime | [Node.js](https://nodejs.org/) |
| Framework | [Express](https://expressjs.com/) |
| Language | TypeScript |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Auth | JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)), [Passport](http://www.passman.org/) / Google ([google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| Payments | [Razorpay](https://razorpay.com/docs/) Node SDK |
| Email | [Nodemailer](https://nodemailer.com/), [Brevo](https://developers.brevo.com/) (Sendinblue) API |
| Validation | [Zod](https://zod.dev/) |
| Logging | [Winston](https://github.com/winstonjs/winston) |
| Security / limits | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), CORS, CSP headers (see `index.ts`) |

> **Note:** `mongoose` is listed as a dependency; the primary data access in the routes shown uses **Prisma** against PostgreSQL.

## Project structure

```
BookStore/
├── frontend/     # Vite + React SPA
├── backend/      # Express API, Prisma schema, routes
└── README.md
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [PostgreSQL](https://www.postgresql.org/) for the database
- Environment variables for the backend (database URL, JWT secrets, OAuth keys, Razorpay keys, email, etc.) — see `backend/.env` (use a local copy; do not commit secrets).

### Backend

```bash
cd backend
npm install
# Configure DATABASE_URL and other vars, then:
npx prisma migrate dev   # or prisma db push, depending on your workflow
npm run dev              # development with nodemon + tsx
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # Vite dev server (see package.json for host/port)
```

Point the frontend API base URL at your running backend (typically configured in the frontend env / `api` utility).

## Scripts (quick reference)

| Location | Command | Purpose |
|----------|---------|---------|
| `frontend` | `npm run dev` | Start Vite dev server |
| `frontend` | `npm run build` | Production build |
| `backend` | `npm run dev` | Start API with hot reload |
| `backend` | `npm run build` | Compile TypeScript to `dist/` |
| `backend` | `npm start` | Run compiled server |

---

*This README is a high-level overview; extend it with deployment notes, API documentation, and contribution guidelines as the project grows.*
