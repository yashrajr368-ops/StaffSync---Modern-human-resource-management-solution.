# StaffSync - Modern Human Resource Management Solution

StaffSync is a comprehensive, enterprise-ready web-based Human Resource Management System (HRMS) built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and styled with **Bootstrap 5** and **Lucide Icons**. It streamlines, digitizes, and automates core HR processes across an organization with strict **Role-Based Access Control (RBAC)** for HR Personnel, Team Managers, and Employees.

---

## 🚀 Key Roles & Capabilities

| Feature Module | HR Administrator | Team Manager | Employee |
| :--- | :---: | :---: | :---: |
| **Authentication & Role Guards** | Full Admin JWT Access | Manager JWT Access | Employee JWT Access |
| **Employee Directory** | Create, Read, Update, Delete & Salary | View Team & Staff Directory | View Staff Directory |
| **Daily Attendance** | View & Adjust Company Logs | View Team Punch Records | 1-Click Clock In / Clock Out |
| **Leave Management** | Organization Review & Approval | Team Review & Approval | Apply, Track Balances & History |
| **Training & Growth** | Organization Program Oversight | Create Programs & Assign Team | Track Progress & Mark Completed |
| **Company Bulletins** | Create, Broadcast & Manage | View & Receive Notices | View & Receive Notices |
| **Tailored Dashboard** | Headcount, Dept KPIs & Org Feed | Team Size, Shift & Leaves | Shift Clock, Leave Badges & Goals |

---

## 📋 Project Breakdown: 6 Epics & 19 Tasks

### Epic 1: User Authentication & Role-Based Access Control (RBAC)
- **Task 1.1**: User Data Modeling & Password Security (Mongoose Schema with `hr`, `manager`, `employee`, bcrypt hashing, default leave allowances)
- **Task 1.2**: JWT Authentication API (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/change-password`)
- **Task 1.3**: RBAC Security Middleware (`protect`, `authorize(['hr', 'manager'])`, token validation)
- **Task 1.4**: Frontend Auth State & Guarded Routing (`AuthContext`, token persistence, automatic redirect guards)

### Epic 2: Employee Profile & Directory Management
- **Task 2.1**: Employee Data Schema & Relationships (Department, designation, phone, address, salary, date of joining)
- **Task 2.2**: Employee CRUD RESTful APIs (`GET /api/employees`, `POST /api/employees`, `PUT /api/employees/:id`, `DELETE /api/employees/:id`)
- **Task 2.3**: Interactive Employee Directory & Profile UI (Real-time search, department filtering, HR Add/Edit modals)

### Epic 3: Attendance Tracking & Clock-In/Clock-Out System
- **Task 3.1**: Attendance Model & Time Calculation (Clock-in, clock-out, total hours, status auto-detection: Present, Late, Half-day)
- **Task 3.2**: Daily Punch-In / Punch-Out APIs (`POST /api/attendance/clock-in`, `POST /api/attendance/clock-out`, `/api/attendance/today`)
- **Task 3.3**: Attendance History & Org Reports APIs (`GET /api/attendance/my-history`, `GET /api/attendance/all`)
- **Task 3.4**: Attendance Dashboard & Clock Widget UI (Live timer, 1-click punch buttons, monthly calendar table, HR log viewer)

### Epic 4: Leave Application & Approval Workflow
- **Task 4.1**: Leave Request Schema & Status Lifecycle (Types: Annual, Casual, Sick, Maternity; statuses: Pending, Approved, Rejected)
- **Task 4.2**: Leave Application & Balance Deduction APIs (`POST /api/leaves`, automated day calculation, balance verification)
- **Task 4.3**: Approval Workflow APIs (`PUT /api/leaves/:id/review`, supervisor feedback, automated leave balance decrement)
- **Task 4.4**: Leave Management UI (Employee application modal, live balance cards, Manager/HR review queue)

### Epic 5: Training & Team Development Programs
- **Task 5.1**: Training Program Schema (Title, description, category, trainer, duration, deadline, assigned employees list)
- **Task 5.2**: Training Management APIs (`GET /api/training`, `POST /api/training`, `PUT /api/training/:id/progress`, `DELETE /api/training/:id`)
- **Task 5.3**: Training & Growth Portal UI (Manager program creator & team tracker, Employee interactive progress updater)

### Epic 6: Company Announcements & Role-Specific Interactive Dashboards
- **Task 6.1**: Company Announcements Model & APIs (`GET /api/announcements`, `POST /api/announcements`, `DELETE /api/announcements/:id`)
- **Task 6.2**: Announcements Board UI (Priority badges: Urgent, Critical, General; HR publication modal; department targeting)
- **Task 6.3**: Interactive Role-Specific Dashboards (`GET /api/dashboard/stats`, specialized HR, Manager, and Employee dynamic views)

---

## 🔑 Demo Login Accounts

Quick 1-click demo login buttons are provided directly on the Login screen:

| Role | Email | Password | Representative |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `hr@staffsync.com` | `password123` | Eleanor Vance (Head of People) |
| **Engineering Manager** | `manager.eng@staffsync.com` | `password123` | Marcus Chen (VP of Eng) |
| **Marketing Manager** | `manager.mkt@staffsync.com` | `password123` | Sophia Rodriguez (Director of Mkt) |
| **Staff Developer** | `alex.dev@staffsync.com` | `password123` | Alex Rivera (Senior Developer) |
| **QA Engineer** | `david.qa@staffsync.com` | `password123` | David Kim (QA Automation) |
| **UI/UX Designer** | `sarah.ui@staffsync.com` | `password123` | Sarah Jenkins (Lead Designer) |

---

## ⚙️ Quick Start Instructions

### 1. Prerequisites
- **Node.js**: v16 or above (Tested on Node v24)
- **npm**: v8 or above
- **MongoDB**: Supports local MongoDB, MongoDB Atlas via `MONGODB_URI`, or the embedded zero-config in-memory engine.

### 2. Environment Configuration
The server includes a `.env` file with default values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2026_dev_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Installation & Running
From the project root directory:

```bash
# Option A: Run Server (which also serves the compiled React app on port 5000)
cd server
npm start

# Option B: Run full-stack development with Vite hot-reload (port 3000)
# Terminal 1:
cd server
npm run dev

# Terminal 2:
cd client
npm run dev
```

Open your browser to:
- Production / Unified App: `http://localhost:5000`
- Vite Dev Server: `http://localhost:3000`

---

## 📁 Project Structure

```
├── client/                     # Frontend (React 18, Vite, Bootstrap 5)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, ProtectedRoute, StatCard
│   │   ├── context/            # AuthContext (JWT State & Session)
│   │   ├── pages/              # Login, Register, Dashboard, Employees, Attendance, Leaves, Training, Announcements, Profile
│   │   ├── services/           # Axios API Client & interceptors
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── index.css           # Custom Bootstrap 5 styling & design tokens
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend (Node.js, Express.js, MongoDB)
│   ├── config/                 # db.js (Dual local/embedded connection) & seed.js
│   ├── controllers/            # auth, employee, attendance, leave, training, announcement, dashboard
│   ├── middleware/             # authMiddleware (JWT protect & authorize), errorHandler
│   ├── models/                 # User, Attendance, Leave, Training, Announcement
│   ├── routes/                 # Express API endpoints
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Express application entry point
├── package.json                # Root orchestrator scripts
└── README.md
```
