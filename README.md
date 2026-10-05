# Task Management REST API

A REST API where users register, log in, and securely manage their own tasks. Built with Node.js, Express, MongoDB and JWT authentication.

## Features

- User registration, login and profile (JWT-based, bcrypt-hashed passwords)
- Task CRUD where users can only access their own tasks
- Search by title/description, filter by status and priority, pagination and sorting
- Input validation, centralised error handling, rate limiting, security headers

## Tech Stack

Node.js, Express, MongoDB (Mongoose), JSON Web Tokens, bcryptjs, express-validator, helmet, express-rate-limit

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local, or a free MongoDB Atlas cluster)

### Setup

```bash
git clone <https://github.com/anshika324/Task-Management-API.git>
cd task-management-api
npm install
cp .env.example .env
```


```bash
npm run dev     # development with auto-reload
npm start       # production
```

The server runs on `http://localhost:5001` by default. Check `GET /health`.

> Port 5000 is avoided on purpose: macOS AirPlay Receiver uses it.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/task_manager` |
| `JWT_SECRET` | Secret used to sign tokens (use a long random string) | `change_me` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |

The server refuses to start if `MONGO_URI` or `JWT_SECRET` is missing.

## API Endpoints

All task endpoints require the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user, returns token | No |
| POST | `/api/auth/login` | Log in, returns token | No |
| GET | `/api/auth/profile` | Get logged-in user's profile | Yes |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List your tasks (search, filter, pagination) |
| GET | `/api/tasks/:id` | Get a single task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

**Task fields:** `title` (required), `description`, `status` (`Pending` | `In Progress` | `Completed`, default `Pending`), `priority` (`Low` | `Medium` | `High`, default `Medium`), `dueDate` (ISO date), `createdAt` (automatic).

### Query parameters for `GET /api/tasks`

| Param | Description |
|---|---|
| `search` | Case-insensitive match on title or description |
| `status` | Filter by status |
| `priority` | Filter by priority |
| `page` | Page number (default 1) |
| `limit` | Items per page (default 10, max 100) |
| `sortBy` | `createdAt` (default), `dueDate`, `priority`, `status`, `title` |
| `order` | `desc` (default) or `asc` |

Example: `GET /api/tasks?status=Completed&page=1&limit=10`

### Example requests

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Anshika","email":"anshika@example.com","password":"password123"}'

# Create a task
curl -X POST http://localhost:5001/api/tasks \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"title":"Write README","priority":"High"}'
```

### Response format

```json
{ "success": true, "count": 1, "pagination": { "total": 1, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }, "tasks": [] }
```

Errors: `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }`

Status codes used: 200, 201, 400 (validation), 401 (auth), 404, 409 (duplicate email), 413, 429 (rate limit), 500.

## Postman

Import `task-management-api.postman_collection.json`. Run **Register** or **Login** first: the token is saved to a collection variable and used automatically by the other requests. **Create Task** saves `taskId` for the single-task requests.

## Project Structure

```
src/
├── config/db.js            # MongoDB connection
├── controllers/            # authController, taskController
├── middleware/             # auth (JWT), validate, errorHandler, rateLimiter
├── models/                 # User, Task
├── routes/                 # authRoutes, taskRoutes
├── app.js                  # Express app setup
└── server.js               # Entry point
```

