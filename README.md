# JobConnect - Full-Stack Modern Job Board Platform

**JobConnect** is an enterprise-ready, full-stack job board and applicant tracking system (ATS) built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**. It provides a complete recruitment workflow for job seekers (candidates) and employers (recruiters).

---

## 🌟 Core Features

### 1. Job Seeker Experience (Candidates)
- **Interactive Home & Job Search:** Search listings by keywords, job titles, technical skills, or location.
- **Advanced Filtering & Sorting:** Filter jobs by Category, Employment Type (Full-Time, Remote, Contract, Internship), Experience Level, and Minimum Salary. Sort by newest or salary.
- **Comprehensive Job Details:** View full descriptions, key responsibilities, qualifications, company profile, and compensation.
- **1-Click / Custom Job Application:**
  - Dedicated application modal.
  - Resume file upload (PDF, DOC, DOCX with size & MIME validation).
  - Option to apply with a saved profile resume or upload a custom tailored CV.
  - Custom cover letter and portfolio / GitHub links.
  - Duplicate application prevention.
- **Candidate Dashboard:**
  - View all submitted applications with real-time status badges (`Pending`, `Reviewed`, `Shortlisted`, `Rejected`, `Withdrawn`).
  - Withdraw eligible applications.
  - Employer feedback and notes visible directly in application cards.
  - Manage saved / bookmarked jobs.
  - Profile management (headline, bio, phone, location, skills, portfolio).
  - Add and edit Work Experience history and Education degrees.
  - Personalized job recommendations with real-time profile match score.

### 2. Intelligent Job Match Criteria Algorithm
- **Weighted 4-Part Scoring System:**
  - **Technical Skills Alignment (45% weight):** Deep intersection between candidate profile skills and job listing requirements.
  - **Experience Level Fit (25% weight):** Compares candidate headline & verified work history against job seniority expectations.
  - **Location & Remote Flexibility (20% weight):** Evaluates remote status, city, and state proximity.
  - **Industry / Education Alignment (10% weight):** Compares university degrees and majors to job category.
- **Interactive UI Components:**
  - **Match Badge (`🎯 X% Match`):** Color-coded on job cards (Green 80%+, Blue 60%+, Amber below 60%).
  - **Match Criteria Breakdown Modal:** Click any match badge to inspect matched skills, missing skills, and detailed criteria scorecard.
  - **Job Match Sidebar Filter:** Filter by Strong Match (75%+), Good Match (50%+), or Overlapping Skills.
  - **Sort by Profile Match:** Instant sort by highest alignment.
  - **Smart Zero-Results Fallback:** When strict filter combinations return 0 exact jobs, displays quick-remove chips and closest matching recommendations.

### 2. Hiring & Recruiter Experience (Employers)
- **Employer Dashboard & Analytics:**
  - Overview cards: Active jobs count, total applicants count, and recent applications stream.
- **Job Management:**
  - Create new job postings with rich metadata (title, category, type, salary range, responsibilities, qualifications, skills).
  - Edit existing listings.
  - Toggle listing status (`active` vs `inactive`).
  - Delete listings (with cascade cleanup of associated applications).
  - Security check: Employers can only manage jobs created by their account.
- **Applicant Pipeline & Resume Review:**
  - Review candidates per job.
  - Download and inspect applicant resumes securely via authorized download route.
  - Update applicant stages (`Pending`, `Reviewed`, `Shortlisted`, `Rejected`).
  - Add review notes for candidates.
- **Company Profile:**
  - Update company brand name, official website, headquarters location, and bio.

### 3. Security & Architecture
- **Authentication:** JWT (JSON Web Tokens) and bcrypt password hashing (10 salt rounds).
- **Authorization:** Role-based access control (`protect`, `authorize('employer')`, `authorize('candidate')`).
- **File Upload Security:** Multer with strict MIME and extension validation (`.pdf`, `.doc`, `.docx`), 5MB size limit, sanitized unique filenames, and private storage (resumes are not exposed publicly via static routes).
- **API Protection:** Helmet headers, CORS configuration, express-validator schema validation, and rate limiting on authentication routes.
- **Email Notifications (Nodemailer):**
  - Application confirmation to candidates.
  - Alert notification to employers when candidates apply.
  - Status update notification to candidates when application status changes.
  - Graceful fallback: If SMTP credentials are not configured, clear development notices are logged without crashing the server.

---

## 🏗️ Project Architecture

```
jobconnect/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, JobCard, ApplyModal, LoadingSpinner
│   │   ├── context/            # AuthContext (JWT state, login, register, logout)
│   │   ├── pages/              # HomePage, JobsPage, JobDetailPage, CompaniesPage,
│   │   │                       # LoginPage, RegisterPage, EmployerDashboard, CandidateDashboard
│   │   ├── services/           # Axios instance with auth interceptor
│   │   ├── App.jsx             # React Router configuration & ProtectedRoute guards
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives & custom styling
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js          # Vite config with /api proxy to port 5000
│   ├── tailwind.config.js      # Custom theme colors (Navy blue & sky accents)
│   ├── postcss.config.js
│   ├── .env.example
│   └── .env
│
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection with retry & error diagnostics
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me, Profile update, Resume upload
│   │   ├── jobController.js    # CRUD jobs, search/filter, employer listings & stats
│   │   ├── applicationController.js # Apply, review pipeline, status update, resume download
│   │   └── savedJobController.js    # Save/unsave jobs
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role authorization
│   │   ├── errorHandler.js     # Centralized error handling
│   │   ├── upload.js           # Multer configuration & file type verification
│   │   └── validate.js         # express-validator result handler
│   ├── models/
│   │   ├── User.js             # Candidate / Employer schema with profile subdocuments
│   │   ├── Job.js              # Job listings with indexing & salary range
│   │   ├── Application.js      # Applications with unique compound candidate-job index
│   │   └── SavedJob.js         # Candidate bookmarked jobs
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── jobRoutes.js        # /api/jobs
│   │   ├── applicationRoutes.js# /api/applications
│   │   └── savedJobRoutes.js   # /api/saved-jobs
│   ├── services/
│   │   └── emailService.js     # Nodemailer email sender with fallback simulation
│   ├── seed/
│   │   └── seed.js             # Realistic demo dataset (12 jobs + 2 accounts + 1 application)
│   ├── uploads/
│   │   └── resumes/            # Secure upload directory
│   ├── app.js                  # Express app setup (Helmet, CORS, rate limits, routes)
│   ├── server.js               # HTTP server entry point
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── .gitignore
└── README.md                   # Complete documentation
```

---

## 🚀 Quick Start Guide (Windows PowerShell & VS Code)

### Prerequisites
1. **Node.js**: v18.0.0 or later (v20+ recommended). Check with `node -v`.
2. **MongoDB**: Local MongoDB instance (`mongod`) OR a free cloud cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).

---

### Step 1: Backend Setup

Open a PowerShell terminal:

```powershell
# Navigate to the server folder
cd jobconnect\server

# Install backend dependencies (already installed if cloned in place)
npm install

# Verify or edit server environment variables
# Copy .env.example to .env if not already present
cp .env.example .env
```

#### Configuring MongoDB:
- **Option A (MongoDB Atlas - Recommended for zero install):**
  1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
  2. Under Database Access, create a user (e.g. `jobconnect_user` with password).
  3. Under Network Access, allow IP `0.0.0.0/0` (allow access from anywhere).
  4. Copy your connection string into `jobconnect/server/.env`:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/jobconnect?retryWrites=true&w=majority
     ```
- **Option B (Local MongoDB):**
  1. Start the MongoDB service:
     ```powershell
     net start MongoDB
     # Or run mongod directly:
     # mongod --dbpath C:\data\db
     ```
  2. Use the local connection string in `server/.env`:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/jobconnect
     ```

#### Seed the Database with Realistic Sample Data:
Run the seed script to populate 12 diverse tech, marketing, data science, and design job listings:

```powershell
npm run seed
```

Output:
```
Connected to MongoDB. Starting database reset & seed...
Cleared existing Users, Jobs, Applications, and SavedJobs.
Created Demo Accounts:
 - Employer:  employer@jobconnect.demo / Employer@1234
 - Candidate: candidate@jobconnect.demo / Candidate@1234
Successfully seeded 12 job listings.
Created sample application & saved job for demo candidate.
Seeding completed successfully!
```

#### Start the Backend Server:
```powershell
npm run dev
# Or: npm start
```
The API will run on `http://localhost:5000`. You can test health at `http://localhost:5000/api/health`.

---

### Step 2: Frontend Setup

Open a **separate** PowerShell terminal in VS Code:

```powershell
# Navigate to the client folder
cd jobconnect\client

# Install frontend dependencies (already installed if cloned in place)
npm install

# Start the Vite development server
npm run dev
```

The frontend will run on **`http://localhost:5173`**. Open this URL in your web browser.

---

## 🔑 Demo Login Accounts

Both accounts are pre-configured in the seed data for instant testing:

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Recruiter / Employer** | `employer@jobconnect.demo` | `Employer@1234` | Create jobs, edit postings, view applicants, download resumes, change pipeline status. |
| **Job Seeker / Candidate** | `candidate@jobconnect.demo` | `Candidate@1234` | Search & filter jobs, apply with custom/profile resume, track submitted applications, save jobs. |

*(Both login cards also feature one-click demo credentials autofill buttons on the `/login` page).*

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate or employer |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user details, bio, links, and skills |
| `POST` | `/api/auth/upload-resume` | Candidate | Upload default profile resume |

### Job Listings (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | List active jobs with keyword search, category, type, and salary filters |
| `GET` | `/api/jobs/:id` | Public | Get single job details with employer information |
| `POST` | `/api/jobs` | Employer | Create a new job listing |
| `PUT` | `/api/jobs/:id` | Employer (Owner) | Update job listing details or active/inactive status |
| `DELETE` | `/api/jobs/:id` | Employer (Owner) | Delete job listing and associated applications |
| `GET` | `/api/jobs/employer/my-jobs` | Employer | Get all jobs posted by logged-in employer with applicant counts |
| `GET` | `/api/jobs/employer/stats` | Employer | Get active jobs count, total applicants count, and recent applications |
| `GET` | `/api/jobs/:id/applications` | Employer (Owner) | View all candidate applications for a specific job |

### Job Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Candidate | Submit job application with resume file, cover note, and portfolio URL |
| `GET` | `/api/applications/my` | Candidate | List all applications submitted by candidate |
| `PATCH` | `/api/applications/:id/status` | Employer (Owner) | Update candidate stage (`Pending`, `Reviewed`, `Shortlisted`, `Rejected`) |
| `PATCH` | `/api/applications/:id/withdraw` | Candidate | Withdraw eligible application |
| `GET` | `/api/applications/:id/resume` | Auth (Owner/Employer) | Securely view/download applicant resume |

### Saved Jobs (`/api/saved-jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/saved-jobs` | Candidate | List all saved/bookmarked jobs |
| `POST` | `/api/saved-jobs/:jobId` | Candidate | Save a job |
| `DELETE` | `/api/saved-jobs/:jobId` | Candidate | Remove a saved job |
| `GET` | `/api/saved-jobs/check/:jobId` | Candidate | Check if a specific job is bookmarked |

---

## 🛠️ Troubleshooting

### 1. MongoDB Connection Error (`connect ECONNREFUSED 127.0.0.1:27017` or `serverSelectionTimeoutMS`)
- **Cause:** Local MongoDB service is not started, or firewall blocks port 27017.
- **Solution:**
  - Start local MongoDB service via Windows PowerShell:
    ```powershell
    net start MongoDB
    ```
  - Or switch to **MongoDB Atlas** (Free Tier): update `MONGODB_URI` in `jobconnect/server/.env` with your Atlas SRV string. Ensure Network Access has `0.0.0.0/0` (any IP) enabled during testing.

### 2. Occupied Port (`EADDRINUSE: address already in use :::5000`)
- **Cause:** Another node process is currently using port 5000.
- **Solution:**
  - In PowerShell, identify and terminate the process:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
    ```
  - Alternatively, change `PORT=5001` in `server/.env` and update `VITE_API_URL=http://localhost:5001/api` in `client/.env`.

### 3. File Upload Issues (`File size limit exceeded` or `Invalid file type`)
- **Requirement:** Uploaded files must have extensions `.pdf`, `.doc`, or `.docx` and be under **5MB**.
- If a candidate already uploaded a resume to their profile, they can simply check "Use this resume" when applying without re-uploading.

### 4. Nodemailer / SMTP Email Notifications
- SMTP configuration is completely optional in development.
- When `SMTP_HOST` or `SMTP_USER` is empty, JobConnect automatically logs clean simulation notices (e.g. `[EmailService - Dev Simulation] To: alex@... Subject: ...`) without crashing or blocking the HTTP response.
- To enable live delivery via Gmail:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_16_character_google_app_password
  ```

---

## 🌐 Production Deployment Guide

### Frontend (Static Hosting - Vercel / Netlify / Render)
1. Build the frontend for production:
   ```powershell
   cd jobconnect\client
   npm run build
   ```
2. The production output is located in `jobconnect/client/dist`.
3. Set the production environment variable on your hosting dashboard:
   ```env
   VITE_API_URL=https://your-backend-api.onrender.com/api
   ```

### Backend (Render / Railway / Fly.io / AWS ECS)
1. Deploy `jobconnect/server` as a Node.js web service.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Set production environment variables in your hosting provider's secrets panel:
   - `PORT=5000` (or host assigned `$PORT`)
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=your_long_random_production_secret`
   - `CLIENT_URL=https://your-frontend.vercel.app`

*(Note: Free tiers on cloud providers such as Render and Atlas may spin down during inactivity or have bandwidth quotas).*
