# FilmApp Backend

Node.js + Express + Prisma + SQLite backend for authentication and user management.

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM & Database client
- **SQLite** - Database (dev)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` (already done, but customize if needed):

```bash
cp .env.example .env
```

Default credentials:
- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

### 3. Generate Prisma Client & Create Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed the Database

```bash
npm run prisma:seed
```

### 5. Start the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on `http://localhost:3001` by default.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout (clears token) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |

### Users

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users/profile` | Yes | Get own profile |
| PUT | `/api/users/profile` | Yes | Update own profile |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user by ID |

---

## Request/Response Examples

### Sign Up

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "message": "User registered successfully"
}
```

### Get Profile

**Request:** `GET /api/users/profile` (with Authorization header or cookie)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "profile": {
      "bio": "About me...",
      "location": "New York"
    }
  }
}
```

---

## Database Schema

### User
- `id` - Primary key
- `email` - Unique
- `password` - Hashed bcrypt
- `name` - Optional
- `role` - user/admin
- `provider` - OAuth provider (google, github)
- `providerId` - OAuth user ID

### Profile
- One-to-one relation with User
- Stores: bio, avatarUrl, location, website, phone

### RefreshToken
- Stores refresh tokens for token rotation

---

## Integration with Frontend

The frontend uses cookies for JWT storage. API calls are proxied through Vite dev server:

1. Frontend calls `/api/...`
2. Vite proxies to `http://localhost:3001`
3. Backend sets `accessToken` cookie (httpOnly, secure in prod)
4. Frontend includes cookies automatically in same-origin requests

---

## Development Tools

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```
Opens at `http://localhost:5555`

### Database Reset
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Switch database to PostgreSQL: change `provider = "postgresql"` in schema
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS (`secure: true` cookie)
- [ ] Add rate limiting
- [ ] Add request logging (morgan)
- [ ] Set up error monitoring (Sentry)

---

## Troubleshooting

### Port already in use
Change `PORT` in `.env` file.

### Database errors
Reset database:
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

### Prisma client not found
Re-generate:
```bash
npx prisma generate
```
