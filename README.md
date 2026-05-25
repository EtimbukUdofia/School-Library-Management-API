# 🏫 School Library Management API

A RESTful API for a School Library System built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.

> TS Academy · Backend Development · Phoenix Cohort · Assignment 1

---

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (JSON Web Tokens) via `jsonwebtoken`
- **Validation**: Joi
- **Password hashing**: bcryptjs

---

## 🚀 Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Clone & install

```bash
git clone <your-repo-url>
cd School-Library-Management-API
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_library   # or your Atlas URI
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

### 3. Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

---

## 🗂️ Project Structure

```
School-Library-Management-API/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authorController.js
│   ├── bookController.js
│   ├── studentController.js
│   └── attendantController.js
├── middleware/
│   ├── auth.js               # JWT protect middleware
│   ├── validate.js           # Joi validation middleware + schemas
│   └── errorHandler.js       # Global error handler
├── models/
│   ├── Author.js
│   ├── Book.js
│   ├── Student.js
│   └── Attendant.js
├── routes/
│   ├── authorRoutes.js
│   ├── bookRoutes.js
│   ├── studentRoutes.js
│   └── attendantRoutes.js
├── utils/
│   └── AppError.js           # Custom error class
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## 🔐 Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

**To obtain a token:**

1. Register an attendant → `POST /api/attendants` (returns token)
2. Or login → `POST /api/attendants/login` (returns token)

---

## 📖 API Documentation

### Base URL: `/api`

---

### 👤 Authors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/authors` | ✅ | Create author |
| `GET` | `/authors` | ❌ | Get all authors |
| `GET` | `/authors/:id` | ❌ | Get single author |
| `PUT` | `/authors/:id` | ✅ | Update author |
| `DELETE` | `/authors/:id` | ✅ | Delete author |

**POST /authors** — Request body:
```json
{
  "name": "Chinua Achebe",
  "bio": "Nigerian novelist and poet"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "author": {
      "_id": "664abc...",
      "name": "Chinua Achebe",
      "bio": "Nigerian novelist and poet",
      "createdAt": "2026-05-25T00:00:00Z",
      "updatedAt": "2026-05-25T00:00:00Z"
    }
  }
}
```

---

### 📚 Books

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/books` | ✅ | Create book |
| `GET` | `/books` | ❌ | Get all books (pagination + search) |
| `GET` | `/books/:id` | ❌ | Get single book (populated) |
| `PUT` | `/books/:id` | ✅ | Update book |
| `DELETE` | `/books/:id` | ✅ | Delete book |
| `POST` | `/books/:id/borrow` | ✅ | Borrow a book |
| `POST` | `/books/:id/return` | ✅ | Return a book |

#### GET /books — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 100) |
| `search` | string | Search by title or author name |
| `overdue` | boolean | If `true`, return only overdue books |

**Example:** `GET /api/books?search=things&page=1&limit=5`

**POST /books** — Request body:
```json
{
  "title": "Things Fall Apart",
  "isbn": "978-0-435-90581-3",
  "authors": ["664abc123..."]
}
```

**Response (book OUT):**
```json
{
  "status": "success",
  "data": {
    "book": {
      "_id": "664def...",
      "title": "Things Fall Apart",
      "isbn": "978-0-435-90581-3",
      "authors": [{ "_id": "664abc...", "name": "Chinua Achebe" }],
      "status": "OUT",
      "borrowedBy": { "_id": "...", "name": "John Doe", "email": "john@school.com" },
      "issuedBy": { "_id": "...", "name": "Jane Smith", "staffId": "STAFF001" },
      "returnDate": "2026-06-01T00:00:00Z",
      "isOverdue": false
    }
  }
}
```

#### POST /books/:id/borrow
```json
{
  "studentId": "<MongoDB ObjectId>",
  "attendantId": "<MongoDB ObjectId>",
  "returnDate": "2026-06-01"
}
```

Rules:
- Book must be `"IN"` (available)
- `studentId` and `attendantId` must reference existing records
- `returnDate` must be a future date

#### POST /books/:id/return
No request body needed.

Rules:
- Book must be `"OUT"` (borrowed)
- Clears `borrowedBy`, `issuedBy`, and `returnDate`; sets status back to `"IN"`

---

### 🎓 Students

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/students` | ✅ | Create student |
| `GET` | `/students` | ❌ | Get all students |
| `GET` | `/students/:id` | ❌ | Get single student |

**POST /students** — Request body:
```json
{
  "name": "John Doe",
  "email": "john.doe@school.com",
  "studentId": "STU2026001"
}
```

---

### 🏢 Attendants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/attendants` | ❌ | Register attendant (returns JWT) |
| `POST` | `/attendants/login` | ❌ | Login (returns JWT) |
| `GET` | `/attendants` | ❌ | Get all attendants |

**POST /attendants** — Request body:
```json
{
  "name": "Jane Smith",
  "staffId": "STAFF001",
  "password": "securepassword"
}
```

**POST /attendants/login** — Request body:
```json
{
  "staffId": "STAFF001",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "attendant": {
      "_id": "664...",
      "name": "Jane Smith",
      "staffId": "STAFF001"
    }
  }
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "status": "fail",
  "message": "Descriptive error message here"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Resource not found |
| 409 | Duplicate key (e.g., ISBN or staffId already exists) |
| 500 | Internal server error |

---

## ✨ Bonus Features

- ✅ **Pagination** — `GET /books?page=1&limit=10`
- ✅ **Search** — `GET /books?search=things` (searches title AND author name)
- ✅ **Duplicate ISBN prevention** — handled via Mongoose unique index + error formatter
- ✅ **Joi validation middleware** — all request bodies validated before hitting controllers
- ✅ **Overdue check** — `GET /books?overdue=true`
- ✅ **JWT Authentication** — all write operations require a valid attendant token
