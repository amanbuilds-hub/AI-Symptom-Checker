# Rural Healthcare Backend

A complete Node.js backend API for the Rural Healthcare Platform with PostgreSQL database.

## Features

- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Role-based access control (Customer, Doctor, Manager)
- ✅ Profile management
- ✅ PostgreSQL database with proper schema
- ✅ Input validation and sanitization
- ✅ Rate limiting and security headers
- ✅ Session management
- ✅ Password hashing with bcrypt

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Make sure you have PostgreSQL installed and running.

Create a database:

```sql
CREATE DATABASE rural_healthcare;
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rural_healthcare
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Start the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Health Check

- `GET /health` - Server health status

## Database Schema

The database includes the following tables:

- `users` - User accounts and profiles
- `doctors` - Extended doctor information
- `consultations` - Medical consultations
- `health_records` - Patient health records
- `messages` - Chat messages
- `notifications` - User notifications
- `user_sessions` - JWT session management

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- SQL injection prevention with parameterized queries

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── migrate.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   └── auth.js
│   ├── utils/
│   │   └── auth.js
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Add middleware and validation
3. Import and use in `src/server.js`

### Database Changes

1. Update `src/database/schema.sql`
2. Run `npm run migrate`

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Set up SSL/TLS
5. Use a process manager like PM2
6. Set up proper logging
7. Configure firewall rules

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists
4. Check network connectivity

### Authentication Issues

1. Verify JWT_SECRET is set
2. Check token expiration
3. Ensure proper headers are sent
4. Check session table for valid sessions

## License

MIT License
