# AmiHive Task 01 — Product & Inventory Management System

A production-structured full-stack inventory module built for the AmiHive Software Solutions technical assessment.

## Stack
- Frontend: React + Vite + Tailwind CSS + Axios
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Validation: express-validator
- Icons: lucide-react

## Requirements covered
- Responsive dashboard
- Product listing with server-side pagination
- Search by product name/SKU
- Category/status filters
- Create, edit, delete with confirmation
- Product detail drawer
- Stock-in and stock-out
- Negative-stock prevention
- Reorder-level low-stock detection
- Recent movement history
- Dashboard totals
- Client/server validation
- Unique SKU
- Loading, error and empty states
- Axios service layer
- REST API separation into routes/controllers/services/models

## Project structure
```text
task1/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ services/
│  │  └─ App.jsx
│  └─ ...
├─ server/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  └─ server.js
│  └─ ...
├─ .env.example
└─ package.json
```

## Setup

### 1. Start MongoDB
Use a local MongoDB installation or Docker:
```bash
docker compose up -d
```

### 2. Configure backend
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 3. Start frontend in another terminal
```bash
cd client
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

Or from the repository root:
```bash
npm install
npm run install:all
npm run dev
```

## Environment
Server `.env`:
```env
PORT=8001
MONGODB_URI=mongodb://127.0.0.1:27017/amihive_inventory
CLIENT_URL=http://localhost:5173
```

Client `.env`:
```env
VITE_API_URL=http://localhost:8001/api
```

## API reference
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | Paginated products, search and filters |
| GET | `/api/products/:id` | Product details |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/stock` | Stock-in / stock-out |
| GET | `/api/products/:id/movements` | Movement history |
| GET | `/api/dashboard/inventory` | Inventory dashboard summary |

## Notes
The stock adjustment endpoint uses an atomic MongoDB update with a guard for stock-out operations, so inventory cannot become negative. Each successful adjustment creates a movement record.

## Fast Windows setup (recommended)
The delivery archive includes local development `.env` files containing only local MongoDB/API configuration (no secrets). If you clone the repository later, copy the two `.env.example` files to `.env` instead.

From the `task1` folder:

```powershell
npm install
npm run install:all
docker compose up -d
npm run seed
npm run dev
```

Open `http://localhost:5173`.

Health check: `http://localhost:8001/api/health`

If the API does not start, confirm Docker Desktop is running and `docker compose ps` shows `amihive-task1-mongo` as running.
