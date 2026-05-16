# InvoiceStack

InvoiceStack is a full-stack invoice management app built with React, Express, MySQL, JWT auth, and Gemini AI.

## Project Structure

```text
invoice-app/
  backend/   Express API + MySQL
  frontend/  React app
```

## Local Development

### 1. Database

Import the schema:

```bash
mysql -u root -p < backend/database.sql
```

### 2. Backend

Copy `backend/.env.example` to `backend/.env` and fill in your values.

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3. Frontend

If you want the default local setup, leave `frontend/.env` empty or copy `frontend/.env.example`.

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000` and proxies `/api` requests to the backend automatically.

## Environment Variables

### Backend

Required:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=invoice_db
JWT_SECRET=change-me
GEMINI_API_KEY=your_gemini_api_key_here
```

Optional:

```env
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=mysql://user:password@host:3306/database
DB_CONNECTION_LIMIT=10
```

`DATABASE_URL` is supported for Railway-style managed MySQL URLs. If it is set, it takes priority over the individual DB fields.

### Frontend

Optional:

```env
REACT_APP_API_URL=
```

Leave it empty for same-origin `/api` requests. Set it only when your frontend is hosted separately from the backend.

## Railway Deployment

This repo is configured so Railway can deploy it from the repository root as a single service.

### What happens in production

- Railway runs `npm run build` from the root.
- The frontend is built into `frontend/build`.
- The backend starts with `npm run start`.
- In production, Express serves the React build and handles all `/api/*` routes.

### Railway setup

1. Create a new Railway project from this repository.
2. Add a MySQL database service, or connect an existing MySQL instance.
3. Set the backend environment variables in Railway.
4. Deploy the root service.

Recommended Railway variables:

```env
NODE_ENV=production
JWT_SECRET=your-strong-secret
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=mysql://user:password@host:3306/database
FRONTEND_URL=https://your-app.up.railway.app
CORS_ORIGIN=https://your-app.up.railway.app
```

If you use Railway's MySQL plugin variables instead of `DATABASE_URL`, the app also supports:

```env
MYSQLHOST=
MYSQLPORT=
MYSQLUSER=
MYSQLPASSWORD=
MYSQLDATABASE=
```

### Health Check

Railway health check endpoint:

```text
/api/health
```

## Root Scripts

From the repository root:

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
npm run build
npm run start
```
