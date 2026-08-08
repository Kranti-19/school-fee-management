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
git clone [https://github.com/Kranti-19/school-fee-management.git](https://github.com/Kranti-19/school-fee-management.git)
cd school-fee-management
2. Backend SetupNavigate to the backend directory:Bashcd backend
Install dependencies:Bashnpm install
Create a .env file in the backend/ folder and add the following variables:Code snippetPORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/school_fee_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
Seed default data and admin account:Bashnode seedData.js
Start the backend server:Bashnpm start
(Backend runs on http://localhost:5000)3. Frontend SetupOpen a new terminal tab and navigate to the frontend directory:Bashcd frontend
Install dependencies:Bashnpm install
Create a .env file in the frontend/ folder:Code snippetVITE_API_BASE_URL=http://localhost:5000
Start the frontend development server:Bashnpm run dev
(Frontend runs on http://localhost:5173)📑 API Endpoints SummaryMethodEndpointDescriptionPOST/api/auth/loginUser authentication & JWT issuanceGET/api/auth/meFetch logged-in user profileGET / POST/api/classesFetch & create class master dataGET / POST/api/studentsFetch & create student recordsGET / POST/api/fee-structuresManage school fee structuresPOST/api/fee-assignmentsAssign fee plans to studentsPOST/api/paymentsRecord fee collection transactions
