# 🏫 School Fee Management System

A full-stack web application designed to streamline school administrative tasks, fee structure creation, student fee assignments, installment tracking, and payment collection workflows.

---

## 🔗 Live Links

* **Live Demo (Frontend):** [https://school-fee-management-pi.vercel.app](https://school-fee-management-pi.vercel.app)
* **API Server (Backend):** [https://school-fee-management-o8n8.onrender.com](https://school-fee-management-o8n8.onrender.com)
* **GitHub Repository:** [https://github.com/Kranti-19/school-fee-management](https://github.com/Kranti-19/school-fee-management)
* **Demo Video:** [Insert Your Demo Video Link Here]

---

## 🔑 Demo Login Credentials

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` (or `admin@school.com`) | `admin123` |

---

## ✨ Features

* **Dashboard Overview:** Real-time visibility into total students, total fee collection, pending collection, today's collection, and overdue balances.
* **Master Data Management:** Manage Academic Years, Classes, and Students cleanly.
* **Fee Structure Builder:** Create flexible fee structures with head names, total amounts, and customizable installment options.
* **Fee Assignment:** Assign fee plans to specific classes/students with automatic net payable and discount calculations.
* **Payment Collection:** Record payments with multiple payment methods (UPI, Bank Transfer, Cash), instant receipt generation, and real-time installment status updates.
* **Secure Authentication:** JWT-based user authentication with encrypted password hashing (`bcryptjs`).

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Axios, Tailwind CSS / Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose ORM)
* **Authentication:** JSON Web Tokens (JWT), Bcrypt
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## 🚀 Local Setup & Installation

Follow these instructions to run the project locally on your machine.

### Prerequisites

* Node.js (v18 or higher)
* MongoDB installed locally OR a MongoDB Atlas cluster URI.
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/Kranti-19/school-fee-management.git
cd school-fee-management
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend/` folder and add the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/school_fee_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

Seed default data and admin account:

```bash
node seedData.js
```

Start the backend server:

```bash
npm start
```

(Backend runs on `http://localhost:5000`)

### 3. Frontend Setup

Open a new terminal tab and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

(Frontend runs on `http://localhost:5173`)

## 📑 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | User authentication & JWT issuance |
| GET | `/api/auth/me` | Fetch logged-in user profile |
| GET / POST | `/api/classes` | Fetch & create class master data |
| GET / POST | `/api/students` | Fetch & create student records |
| GET / POST | `/api/fee-structures` | Manage school fee structures |
| POST | `/api/fee-assignments` | Assign fee plans to students |
| POST | `/api/payments` | Record fee collection transactions |
