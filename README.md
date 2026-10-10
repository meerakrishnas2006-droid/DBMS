# MediCare – Hospital Management System (HMS)

A full-stack, enterprise-grade Hospital Management System designed for robust healthcare administration, clinical workflow management, inpatient tracking, pharmacy, lab diagnostics, billing, and role-based operational oversight.

Built with a **Node.js / Express.js REST API**, **PostgreSQL** relational database (featuring advanced schemas, constraints, indexes, triggers, stored procedures, and audit views), and a **responsive web frontend**.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Key Features & Modules](#key-features--modules)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation Guide](#setup--installation-guide)
  - [1. Environment Configuration](#1-environment-configuration)
  - [2. Install Backend Dependencies](#2-install-backend-dependencies)
  - [3. Initialize and Seed the Database](#3-initialize-and-seed-the-database)
- [Running the Application](#running-the-application)
  - [1. Start the Backend API Server](#1-start-the-backend-api-server)
  - [2. Launch the Frontend Interface](#2-launch-the-frontend-interface)
- [Default Demo Credentials](#default-demo-credentials)
- [Database Scripts Reference](#database-scripts-reference)
- [API Route Reference](#api-route-reference)
- [Running Automated Tests](#running-automated-tests)
- [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    Frontend Client                        │
│       HTML5 / Vanilla CSS3 / Modern JavaScript (ES6+)     │
│   Landing Portal (index.html) & Dashboard (dashboard.html)│
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTP REST Requests (JWT Auth)
                              ▼
┌───────────────────────────────────────────────────────────┐
│                   Node.js / Express API                   │
│      Port: 5001 | Helmet | CORS | Rate-Limiter | JWT      │
└─────────────────────────────┬─────────────────────────────┘
                              │ Connection Pool (pg)
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                    │
│   Tables, Constraints, Indexes, Views, Triggers, Procs    │
└───────────────────────────────────────────────────────────┘
```

---

## Key Features & Modules

- **Authentication & RBAC**: Secure role-based access control (Admin, Doctor, Pharmacist, Billing Officer, Staff, Nurse).
- **Patient Management**: Complete patient records, medical history, vital statistics, admissions, and status tracking.
- **Doctor & Department Administration**: Specialty mapping, duty shift scheduling, and consultation pricing.
- **Appointment Scheduling**: Real-time booking, doctor availability verification, and status workflows.
- **Inpatient & Bed Allocation**: Real-time room and bed allocation with automated availability status triggers.
- **Clinical Records & Prescriptions**: Digital prescription authoring, diagnoses, and pharmacy fulfillment workflows.
- **Pharmacy & Inventory**: Medication inventory tracking, batch monitoring, and dispense logging.
- **Lab Tests & OT Scheduling**: Diagnostic order processing, test results logging, and operation theatre schedule management.
- **Billing & Payments**: Automated bill computation, room charges, consultation fee collation, and invoice generation.
- **Human Resources & Payroll**: Staff management, nurse duty assignments, shift logs, and salary structures.
- **Analytics & Reporting**: Occupancy rates, financial summaries, department workload, and audit logging.

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
2. **PostgreSQL**: `v14.x` or higher ([Download PostgreSQL](https://www.postgresql.org/))
3. **psql CLI**: PostgreSQL command-line tool accessible from your terminal
4. **Git**: Version control system

Verify installations:
```bash
node -v
npm -v
psql --version
```

---

## Project Structure

```text
DBMS/
├── DBMS FRONTEND/              # Web Client
│   ├── assets/                 # Icons, images, and branding assets
│   ├── css/
│   │   └── styles.css          # Core design system and responsive styles
│   ├── js/
│   │   ├── app.js              # Application logic, DOM events, and API client
│   │   └── mock-data.js        # Fallback offline simulation data
│   ├── pages/                  # Sub-views and module interfaces
│   ├── dashboard.html          # Main application dashboard
│   └── index.html              # Login & landing portal
├── backend/                    # Node.js & Express REST API
│   ├── scripts/
│   │   └── init-db.js          # Automated database provisioning runner
│   ├── src/
│   │   ├── config/             # Database connection pool configuration
│   │   ├── controllers/        # Route controllers and business logic
│   │   ├── middleware/         # JWT verification, authorization, error handler
│   │   ├── routes/             # Express API routers
│   │   ├── utils/              # Standardized API response formatters
│   │   ├── app.js              # Express app setup and middleware pipeline
│   │   └── server.js           # Server startup script
│   ├── tests/                  # Integration tests
│   ├── .env.example            # Sample environment variables
│   └── package.json            # Node.js dependencies and scripts
└── database/                   # Relational Database SQL Files
    ├── 01_schema.sql           # Table definitions & structures
    ├── 02_constraints.sql      # Primary keys, foreign keys & check rules
    ├── 03_indexes.sql          # Performance optimization indexes
    ├── 04_functions.sql        # Stored functions and procedural calculations
    ├── 05_triggers.sql         # Business logic automation triggers
    ├── 06_views.sql            # Materialized & analytical reporting views
    ├── 07_seed.sql             # Comprehensive seed data for demo testing
    └── 08_test_queries.sql     # Verification & sample relational queries
```

---

## Setup & Installation Guide

### 1. Environment Configuration

Navigate to the `backend` directory and set up your `.env` configuration file:

```bash
cd backend
cp .env.example .env
```

Open `.env` in your text editor and adjust the settings to match your PostgreSQL credentials:

```ini
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medicare_hms
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
SERVER_PORT=5001
JWT_SECRET=super_secret_jwt_key_replace_in_production
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

> **Note**: Make sure `SERVER_PORT` is set to `5001` (the frontend connects to `http://localhost:5001/api`).

---

### 2. Install Backend Dependencies

Inside the `backend/` directory, install all required npm packages:

```bash
cd backend
npm install
```

---

### 3. Initialize and Seed the Database

Ensure your PostgreSQL server is running. Then, run the automated database initialization script:

```bash
cd backend
npm run db:init
```

This single command will:
1. Connect to PostgreSQL and check if `medicare_hms` database exists (creating it if necessary).
2. Execute all schema scripts in sequence:
   - `01_schema.sql` (Creates all tables: branches, departments, doctors, nurses, patients, beds, bills, etc.)
   - `02_constraints.sql` (Applies foreign keys and validations)
   - `03_indexes.sql` (Builds query optimization indexes)
   - `04_functions.sql` (Creates calculation and validation functions)
   - `05_triggers.sql` (Sets up automatic bed status & audit triggers)
   - `06_views.sql` (Generates reporting views)
   - `07_seed.sql` (Seeds demo departments, doctors, staff, patients, bills, and user logins)
   - `08_test_queries.sql` (Executes baseline test queries)

*(Optional)* If you ever need to re-seed demo data alone:
```bash
npm run db:seed
```

---

## Running the Application

### 1. Start the Backend API Server

From the `backend` directory, start the API:

- **Development Mode (with auto-restart via nodemon):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

Once started, verify the API is running by checking the health endpoint:
```text
http://localhost:5001/api/health
```
Expected response:
```json
{ "success": true, "message": "Hospital Management System API is running." }
```

---

### 2. Launch the Frontend Interface

You can serve the frontend using any local web server or open it directly in your browser.

#### Option A: Using `npx serve` (Recommended)
From the root directory:
```bash
npx -y serve "DBMS FRONTEND" -l 3000
```
Then navigate to: `http://localhost:3000`

#### Option B: Using Python 3 built-in HTTP server
From the `DBMS FRONTEND` directory:
```bash
cd "DBMS FRONTEND"
python3 -m http.server 3000
```
Then open: `http://localhost:3000`

#### Option C: Direct Browser Opening
Simply double-click or open `DBMS FRONTEND/index.html` directly in Google Chrome, Firefox, or Safari.

---

## Default Demo Credentials

The database comes pre-seeded with accounts for all major hospital roles:

| Role | Username | Password | Permitted Modules & Access |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | Full system access, staff, branches, payroll, and settings |
| **Doctor** | `doctor.sarah` | `doctor123` | Patients, Appointments, Prescriptions, OT, Lab Results |
| **Pharmacist** | `pharmacist.kevin` | `pharmacist123` | Pharmacy inventory, Prescriptions, Medicine dispensing |
| **Billing Officer** | `billing.fiona` | `billing123` | Invoices, Payments, Billing, Financial reports |

---

## Database Scripts Reference

| Script | Purpose |
| :--- | :--- |
| `database/01_schema.sql` | Defines relational tables (`branch`, `department`, `doctor`, `nurse`, `patient`, `admission`, `room`, `bed`, `appointment`, `bill`, `salary`, `user_account`, etc.) |
| `database/02_constraints.sql` | Establishes referential integrity, foreign key cascades, and check constraints |
| `database/03_indexes.sql` | Adds B-Tree indexes on frequent lookup fields (dates, patient IDs, doctor IDs, statuses) |
| `database/04_functions.sql` | Contains PL/pgSQL routines for billing summaries and room availability checks |
| `database/05_triggers.sql` | Triggers that automatically update bed occupancy upon patient admission or discharge |
| `database/06_views.sql` | Analytical views including `vw_patient_summary`, `vw_bed_occupancy`, `vw_daily_revenue` |
| `database/07_seed.sql` | Realistic starter data with branches, doctors, patients, admissions, and bcrypt-hashed accounts |
| `database/08_test_queries.sql` | Multi-table joins and aggregation queries validating relational performance |

---

## API Route Reference

All API routes are prefixed with `/api` and require a Bearer token in the `Authorization` header (except `/auth/login` and `/health`).

| Endpoint Route | Description |
| :--- | :--- |
| `POST /api/auth/login` | Authenticate user and receive JWT bearer token |
| `GET  /api/health` | Service health status check |
| `GET  /api/dashboard/stats` | High-level metrics for dashboard cards and KPIs |
| `GET  /api/patients` | Retrieve list of patients with search and filtering |
| `POST /api/patients` | Register a new patient |
| `GET  /api/doctors` | List doctors, specialties, and consultation rates |
| `GET  /api/appointments` | View appointments schedule |
| `POST /api/appointments` | Book a new consultation appointment |
| `GET  /api/rooms` | Query wards, rooms, and live bed occupancy |
| `GET  /api/prescriptions` | Retrieve clinical prescriptions |
| `POST /api/prescriptions` | Issue a new patient prescription |
| `GET  /api/medicines` | Query pharmacy medicine inventory |
| `GET  /api/billing` | Fetch invoices, charges, and settlement statuses |
| `POST /api/billing` | Generate a new patient invoice |
| `GET  /api/staff` | Staff members directory and payroll records |
| `GET  /api/reports/occupancy`| Inpatient bed occupancy analytics |
| `GET  /api/reports/financial`| Revenue and collections breakdown report |

---

## Running Automated Tests

To run the backend test suite:

```bash
cd backend
npm test
```

---

## Troubleshooting & FAQs

### 1. `psql: error: connection to server on socket failed`
- **Cause**: PostgreSQL server is not running on your machine.
- **Fix (macOS via Homebrew)**:
  ```bash
  brew services start postgresql@14
  # or
  brew services start postgresql
  ```
- **Fix (Linux systemd)**:
  ```bash
  sudo systemctl start postgresql
  ```
- **Fix (Windows)**:
  Start the PostgreSQL service from `services.msc`.

### 2. `Invalid username or password` on Login
- Ensure you have executed `npm run db:init` so the `user_account` table is populated with bcrypt-encrypted passwords from `07_seed.sql`.
- Check that your user is active in the database:
  ```sql
  SELECT username, role, status FROM user_account;
  ```

### 3. Port Conflicts (`EADDRINUSE: address already in use :::5001`)
- Another process is using port `5001`. You can identify and terminate it:
  ```bash
  # Find PID on macOS/Linux
  lsof -i :5001
  kill -9 <PID>
  ```
- Alternatively, modify `SERVER_PORT` in `backend/.env` and update `API_BASE` in `DBMS FRONTEND/js/app.js`.

### 4. CORS Errors in the Browser
- The backend has `cors` enabled for all origins in development mode. Ensure the backend is running on `http://localhost:5001` and that your browser is not blocking local network requests.

---

## License

This project is developed as part of a Database Management Systems (DBMS) coursework and is licensed under the MIT License.
