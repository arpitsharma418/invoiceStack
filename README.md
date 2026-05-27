# InvoiceStack - Invoice Management Platform

A simple app to create and manage invoices. It has three main parts:
- **Frontend** - React
- **Backend** - Node.js
- **Database** - MongoDB

---

## Setup for Local Development

### Backend Setup

1. Go to the backend folder and install packages:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Create a `.env` file in the `backend` folder (see `backend/.env` for reference)

### Frontend Setup

1. Go to the frontend folder and install packages:
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. The app will open in your browser at `http://localhost:3000`

---

## Deploy Online

### Step 1: Database (MongoDB Atlas)

1. Create a free database cluster on MongoDB Atlas.
2. Copy your connection string.
3. Save this as `MONGODB_URI` in your environment settings

### Step 2: Backend (Deploy to Render)

1. Go to Render.com and create a new Web Service
2. Connect your code repository
3. Set the Root Directory to `backend`
4. Add these environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = `your-secret-key`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `CORS_ORIGIN` = `https://your-frontend-url.vercel.app`
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app`

5. Deploy and copy your backend URL (like `https://your-backend.onrender.com`)

### Step 3: Frontend (Deploy to Vercel)

1. Go to Vercel.com and import your frontend folder
2. Add this environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

3. Deploy your frontend

---

## How It Works

- **Frontend** is the website where users login and create invoices
- **Backend** handles all the business logic and talks to the database
- **Database** stores all user and invoice information
- They talk to each other using the API

---

## Important Notes

- The database stores invoices with all items inside.
- All three parts can be updated independently
- `frontend/build` is created automatically and should not be saved to git
