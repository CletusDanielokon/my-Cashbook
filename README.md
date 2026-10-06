# CashBook

CashBook is a personal finance web application for recording income and expenses, setting a monthly budget, tracking savings goals, and viewing reports. Each user has a private account, and all data is stored in MongoDB.

## Features

- **Authentication:** register and log in with email or phone number. Passwords are hashed with bcrypt and sessions use JSON Web Tokens (JWT, 7-day expiry).
- **Dashboard:** total balance, income and expenses, recent transactions, and a quick-add form.
- **Transactions:** add, edit and delete transactions, with search and filters by type, category and period.
- **Budget:** set a monthly budget and see spending against it with a colour-coded progress bar.
- **Savings goals:** create, edit and delete goals with target, amount saved and progress.
- **Reports:** income, expenses and balance for a chosen date range, with a category breakdown.
- **Settings:** light and dark theme.
- **Per-user data:** every database query is filtered by the logged-in user, so users only see their own records.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, JavaScript, Tailwind CSS, Font Awesome |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |

## Project Structure

```
tt/
├── index.html / index.js              Login and register
├── welcome.html / welcome.js          Post-login welcome
├── dashboard.html / dashboard.js      Overview
├── transactions.html / transactions.js
├── budget.html / budget.js            Budget and savings goals
├── reports.html / reports.js
├── profile.html / profile.js
├── settings.html / settings.js
└── backend/
    ├── server.js                      Express app and MongoDB connection
    ├── db.js
    ├── middleware/authMiddleware.js   JWT check (sets req.userId)
    ├── models/                        User, Transaction, Budget, Goal
    └── routes/                        auth, transactions, budget, goals
```

## Getting Started

### Prerequisites
- Node.js 18 or later
- A MongoDB Atlas cluster (or a local MongoDB)

### 1. Configure the backend
Create `backend/.env` (see `backend/.env.example`):

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cashbook?retryWrites=true&w=majority
JWT_SECRET=<a-long-random-string>
```

In MongoDB Atlas, allow your IP address under **Network Access**.

### 2. Start the backend
```bash
cd backend
npm install
npx nodemon server.js
```
You should see `MongoDB connected successfully!` and `CashBook backend running on http://localhost:5000`.

### 3. Open the frontend
Open `index.html` with VS Code Live Server (or any static server). The backend must be running first.

## API Reference

All routes except register and login require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account (returns a token) |
| POST | `/api/auth/login` | Log in with email or phone and password |
| GET | `/api/transactions` | List the user's transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budget` | Get the monthly budget |
| PUT | `/api/budget` | Set or update the monthly budget |
| GET | `/api/goals` | List savings goals |
| POST | `/api/goals` | Create a goal |
| PUT | `/api/goals/:id` | Update a goal |
| DELETE | `/api/goals/:id` | Delete a goal |

## Data Models

- **User:** fullName, mobile, email (unique), book, password (hashed)
- **Transaction:** user, description, amount, date, time, category, type (`income` or `expense`)
- **Budget:** user (unique), amount
- **Goal:** user, name, target, saved

## Known Limitations and Future Work

- Password reset and Google login are not yet implemented (the buttons are placeholders).
- The API address (`http://localhost:5000`) is hard-coded in the frontend files and should become a configuration value before deployment.
- The JWT is kept in `localStorage`; an httpOnly cookie would be safer in production.
- No automated tests, rate limiting or CORS restrictions yet.
- Planned: deployment, export of reports to PDF or CSV, and recurring transactions.