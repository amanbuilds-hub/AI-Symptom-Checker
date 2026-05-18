# Complete Setup Instructions

## Overview

This project now uses a custom Node.js backend instead of Supabase. Follow these steps to get everything running.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Backend Setup

### 1. Database Setup (SQLite)

The project uses SQLite, which requires no separate installation. The database file (`database.sqlite`) will be automatically created and managed by the backend.

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (this will also build the sqlite3 module for your system)
npm install

# Copy environment file
cp .env.example .env
```

### 4. Configure Environment

Edit `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (SQLite)
DATABASE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 5. Run Database Migrations

```bash
# From backend directory
npm run migrate
```

### 6. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The backend will be running on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Update Environment Variables

The `frontend/.env` file has been updated to use the new backend:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:5000/api

# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=AIzaSyCiOAeaaZKWkhIE8Mng8eo1qY-ksHXs-_o
```

### 3. Start Frontend

```bash
# From frontend directory
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Running Both Backend and Frontend Together

You can start both frontend and backend concurrently from the project root directory:

1. Install root and nested dependencies:
   ```bash
   npm run install:all
   ```
2. Start all services:
   ```bash
   npm run start:all
   ```

## Testing the Setup

### 1. Health Check

Visit `http://localhost:5000/health` - you should see:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### 2. Test Registration

1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Fill out the form
4. Submit - you should be logged in successfully

### 3. Test Login

1. Sign out
2. Click "Sign In"
3. Use your credentials
4. Should log in successfully

## API Endpoints

The backend provides these endpoints:

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `GET /health` - Health check

## Database Schema

The database includes these tables:

- `users` - User accounts and profiles
- `doctors` - Doctor-specific information
- `consultations` - Medical consultations
- `health_records` - Patient health records
- `messages` - Chat messages
- `notifications` - User notifications
- `user_sessions` - JWT session management

## Troubleshooting

### Backend Issues

**Database connection failed:**

1. Ensure `database.sqlite` exists (or will be created)
2. Verify `DATABASE_PATH` in `.env`

**Port already in use:**

```bash
# Kill process on port 5000
npx kill-port 5000
```

**Migration failed:**

1. Check if `database.sqlite` is locked by another process
2. Check for syntax errors in schema.sql

### Frontend Issues

**API connection failed:**

1. Ensure backend is running on port 5000
2. Check VITE_API_URL in .env
3. Check browser console for CORS errors

**Authentication not working:**

1. Clear localStorage
2. Check JWT_SECRET is set in backend
3. Verify token is being sent in requests

### Common Solutions

**Clear everything and restart:**

```bash
# Stop all servers
# Clear browser localStorage
# Restart backend
cd backend && npm run dev

# Restart frontend (in new terminal)
cd frontend && npm run dev
```

**Reset database:**

```bash
# Delete the SQLite database file
rm backend/database.sqlite

# Run migrations again
cd backend && npm run migrate
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure proper database (not localhost)
4. Set up SSL certificates
5. Use process manager (PM2)
6. Configure reverse proxy (nginx)
7. Set up monitoring and logging

## Support

If you encounter issues:

1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set
3. Ensure all services are running
4. Check database connectivity
5. Clear browser cache and localStorage

The new backend provides full control over authentication and database operations, eliminating the Supabase RLS issues you were experiencing.
