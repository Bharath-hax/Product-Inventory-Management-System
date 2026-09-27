# Task 01 — Product & Inventory Management System

A full-stack inventory management application built with **React.js + Tailwind CSS** on the
frontend and **Node.js + Express.js + MongoDB (Mongoose)** on the backend, using **Axios** for
all API communication.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Key Design Decisions](#key-design-decisions)

## Architecture Overview

```
React (Vite) + Tailwind + Axios  <---->  Express REST API  <---->  MongoDB (Mongoose)
        frontend/                            backend/
```

- The **frontend** is a Vite-powered React SPA. All screens are built from small, reusable
  components (`Table`, `Modal`, `ConfirmDialog`, `Pagination`, `ProductForm`, `StockAdjustForm`).
  A single Axios instance (`src/api/axiosClient.js`) centralizes the base URL and error handling;
  `src/api/productApi.js` is the service layer every page calls into — no component talks to
  Axios directly.
- The **backend** follows a clean `routes → controllers → models` separation. Validation is
  handled with `express-validator`, all async route handlers are wrapped with a shared
  `asyncHandler` so errors flow into one centralized `errorHandler` middleware that returns
  consistent JSON error responses and correct HTTP status codes.
- **Stock movements** are stored in their own collection (`StockMovement`) rather than as an
  embedded array on the product, so history can be paginated independently and never bloats the
  product document.

## Tech Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend    | Node.js, Express.js, express-validator, morgan |
| Database   | MongoDB with Mongoose ODM                     |

## Project Structure

```
task1/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── productController.js     # CRUD + stock logic
│   │   └── dashboardController.js   # Inventory summary
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Product.js
│   │   └── StockMovement.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/            # axiosClient.js, productApi.js
    │   ├── components/     # Navbar, Table, Modal, Pagination, ProductForm, ...
    │   ├── pages/           # Dashboard.jsx, Products.jsx, ProductDetail.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

## Setup & Installation

### Prerequisites
- Node.js v18+ and npm
- A running MongoDB instance (local install or a free MongoDB Atlas cluster)

### 1. Clone / unzip and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Copy the example files and fill in your own values (see [Environment Variables](#environment-variables)):

```bash
cd backend  && cp .env.example .env
cd ../frontend && cp .env.example .env
```

## Environment Variables

**backend/.env**

| Variable      | Description                                 | Example                                      |
|---------------|----------------------------------------------|-----------------------------------------------|
| `PORT`        | Port the API server listens on               | `5000`                                        |
| `NODE_ENV`    | Environment mode                             | `development`                                 |
| `MONGO_URI`   | MongoDB connection string                    | `mongodb://127.0.0.1:27017/amihive_inventory` |
| `CLIENT_URL`  | Allowed CORS origin (the frontend URL)       | `http://localhost:5173`                       |

**frontend/.env**

| Variable              | Description               | Example                        |
|-----------------------|----------------------------|---------------------------------|
| `VITE_API_BASE_URL`   | Base URL of the backend API | `http://localhost:5000/api`   |

> No URLs, credentials or secrets are hardcoded anywhere in the source — everything reads from
> `process.env` / `import.meta.env`.

## Running the Application

Make sure Docker Desktop is running, then start MongoDB once from the project root:

```powershell
docker start task1-mongodb
```

Open two terminals. Run each command from the folder that contains its `package.json`:

**Terminal 1 — backend (`http://localhost:5000`)**

```powershell
cd "C:\Users\<your-user>\Downloads\task1\backend"
npm run dev
```

**Terminal 2 — frontend (`http://localhost:5173`)**

```powershell
cd "C:\Users\<your-user>\Downloads\task1\frontend"
npm run dev
```

Open `http://localhost:5173` in your browser. Do not run `npm run dev` from the
`task1` root because it does not contain a `package.json`.

### Port already in use

Only start one backend process. Check which process owns port `5000`:

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen
```

Stop that process only if it is an old copy of this backend, replacing `<PID>`:

```powershell
Stop-Process -Id <PID>
```

Alternatively, change `PORT=5000` in `backend/.env` and use the same port in
`frontend/.env` as `VITE_API_BASE_URL=http://localhost:<port>/api`.

The dashboard, product list, product detail, and stock-adjustment flows all talk to the live API.

## API Reference

Base URL: `/api`

| Method | Endpoint                       | Description                                       |
|--------|---------------------------------|----------------------------------------------------|
| GET    | `/products`                    | List products — supports `page`, `limit`, `search`, `category`, `status`, `lowStock=true` |
| GET    | `/products/:id`                 | Get a single product                               |
| POST   | `/products`                     | Create a product (validates required fields + unique SKU) |
| PUT    | `/products/:id`                 | Update a product                                   |
| DELETE | `/products/:id`                 | Delete a product (and its stock-movement history)  |
| POST   | `/products/:id/stock`           | Body: `{ type: 'in'|'out', quantity, note }` — adjusts stock, blocks negative stock, records a movement |
| GET    | `/products/:id/movements`       | Paginated stock-movement history for a product      |
| GET    | `/dashboard/inventory`           | Totals, active count, low-stock count, total units, recent movements, low-stock list |

All error responses are shaped as:
```json
{ "success": false, "message": "Human readable message" }
```

Validation errors additionally include an `errors` array with `{ field, message }` pairs.

## Key Design Decisions

- **Preventing negative stock**: enforced both in the UI (client-side check before submit) and
  authoritatively in the backend (`adjustStock` rejects any `stock-out` that would take quantity
  below zero) — the backend is always the source of truth.
- **Low stock detection**: computed with a MongoDB `$expr` comparing `stockQuantity` to
  `reorderLevel` directly in the query, so it stays correct without a stored/derived flag.
- **Unique SKU**: enforced with a unique index in Mongoose plus an explicit pre-check in the
  controller so a friendly `409 Conflict` message is returned instead of a raw duplicate-key
  error.
- **Debounced search**: the Products page debounces the search input by 300ms before calling the
  API, avoiding a request on every keystroke.
