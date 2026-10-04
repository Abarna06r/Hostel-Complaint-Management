# Hostel Complaint Management System (HostelCare)

A complete, full-stack web application designed for residential university and college hostels. Enables resident students to register, submit, and visually track maintenance grievances, while empowering hostel wardens and administrative staff to triage, prioritize, assign, and resolve issues with transparent audit timelines.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Database Models](#database-models)
- [Authentication & Role-Based Authorization](#authentication--role-based-authorization)
- [Installation & Setup](#installation--setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Database Seeding & Admin Creation](#2-database-seeding--admin-creation)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Application](#running-the-application)
- [Demo Credentials for Viva / Testing](#demo-credentials-for-viva--testing)
- [REST API Documentation](#rest-api-documentation)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Viva Presentation Tips](#viva-presentation-tips)
- [Pushing to GitHub](#pushing-to-github)

---

## Overview & Architecture

HostelCare replaces cumbersome manual complaint registers and informal chat channels with an automated, auditable grievance tracking platform.

```
+-------------------------------------------------------------+
|                     REACT CLIENT (Vite)                     |
|  - Student Portal (Dashboard, Submit, My Complaints)        |
|  - Warden Desk (Dashboard, Master Complaints, Categories)   |
|  - Context API: AuthContext, ToastContext, Notification     |
+-------------------------------------------------------------+
                              |
                     Axios + JWT Bearer
                              v
+-------------------------------------------------------------+
|                 EXPRESS.JS REST API SERVER                  |
|  - Middleware: Helmet, CORS, Rate Limit, Auth, Upload       |
|  - Controllers: Auth, Complaint, Admin, Category, Notif     |
+-------------------------------------------------------------+
                              |
                           Mongoose
                              v
+-------------------------------------------------------------+
|                      MONGODB DATABASE                       |
|  - Collections: Users, Complaints, Categories, Notifications|
+-------------------------------------------------------------+
```

---

## Key Features

### For Students
- **Account Registration & Login**: Unique Student ID (Roll No.), Email, Phone, Hostel name, Block, and Room Number.
- **Interactive Dashboard**: Real-time summary counters (Total, Pending, In Progress, Resolved, Rejected) and recent complaint feeds.
- **Complaint Submission**: Select from verified categories, set urgency/priority (`Low`, `Medium`, `High`, `Urgent`), specify location within hostel, and attach images.
- **Progress Tracking & Visual Stepper**: Dynamic 4-stage visual timeline tracking status from `Submitted` -> `Assigned` -> `In Progress` -> `Resolved` (with special handling for `Rejected`).
- **My Complaints Directory**: Filter by category, status, and priority; search by title or ticket ID; sort by creation date.
- **Edit & Cancel Complaints**: Students can update details or cancel pending complaints.
- **Profile & Password Management**: Manage personal details and change account passwords securely with bcrypt encryption.
- **In-App Notifications**: Real-time alerts when complaints are assigned, status is updated, or resolution notes are added.

### For Administrators / Hostel Wardens
- **Warden Overview Dashboard**: Comprehensive metrics for total issues, pending triage, category distribution, and urgent attention queues.
- **Master Grievance Directory**: Search by student name, roll number, complaint ID, or room; filter by hostel, priority, and category.
- **Complaint Triage & Actions**:
  - Assign maintenance personnel (Electrician team, plumbing contractor, carpentry, etc.).
  - Update status (`Pending`, `Assigned`, `In Progress`, `Resolved`, `Rejected`).
  - Add supervisory remarks logged into the student's audit trail.
  - Record verified resolution notes.
  - Reject invalid or duplicate requests with mandatory justification.
- **Student Management**: View student profiles, room details, and past grievance history.
- **Complaint Category Management**: Create, update, and activate/deactivate maintenance domains.

---

## Technology Stack

- **Frontend**:
  - React.js (v18)
  - Vite (Build Tool & Dev Server)
  - Tailwind CSS (Utility-First Modern Styling)
  - React Router DOM (v6 for client-side routing)
  - Axios (HTTP client with JWT interceptors)
  - Lucide React (Clean icon set)
  - React Context API (Auth, Notifications, and Toasts)

- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose ODM
  - JSON Web Tokens (`jsonwebtoken`)
  - Password Hashing with `bcryptjs`
  - Security with `helmet`, `cors`, and `express-rate-limit`
  - File Uploads with `multer`

---

## Project Directory Structure

```
hostel-complaint-management/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Button, Input, Select, Badge, Modal, ConfirmDialog, etc.
│   │   │   ├── complaints/         # ComplaintTimeline, etc.
│   │   │   ├── layout/             # Navbar, Sidebar, Topbar, DashboardLayout
│   │   │   └── notifications/      # NotificationDropdown
│   │   ├── context/                # AuthContext, NotificationContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/              # AdminDashboard, AdminComplaints, ManageStudents, Categories
│   │   │   ├── auth/               # LoginPage, RegisterPage
│   │   │   ├── student/            # StudentDashboard, SubmitComplaint, MyComplaints, Details, Profile
│   │   │   ├── LandingPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/                 # AppRoutes, ProtectedRoute
│   │   ├── services/               # api.js, authService, complaintService, adminService, etc.
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/                     # db.js (MongoDB Connection)
│   ├── controllers/                # authController, complaintController, adminController, etc.
│   ├── middleware/                 # auth.js, errorHandler.js, upload.js
│   ├── models/                     # User.js, Complaint.js, Category.js, Notification.js
│   ├── routes/                     # authRoutes, complaintRoutes, adminRoutes, etc.
│   ├── scripts/                    # seed.js (Database initialization)
│   ├── uploads/                    # Stored attachment files
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

---

## Database Models

### 1. User (`models/User.js`)
| Field | Type | Description |
|---|---|---|
| `name` | String | Full name of student or warden |
| `studentId` | String | Unique Roll No. / Identifier (e.g. STU2024001) |
| `email` | String | Unique institutional email address |
| `phone` | String | Contact phone number |
| `gender` | String | Male / Female / Other |
| `hostel` | String | Hostel name (e.g. Aryabhatta Hall) |
| `block` | String | Block / Wing (e.g. B Block) |
| `roomNumber` | String | Resident room number |
| `password` | String | Hashed with bcrypt (salt 10), hidden by default |
| `role` | String | `student` or `admin` |

### 2. Complaint (`models/Complaint.js`)
| Field | Type | Description |
|---|---|---|
| `complaintId` | String | Auto-generated human-friendly code (e.g. `CMP-2026-000184`) |
| `title` | String | Brief summary of the problem |
| `description` | String | Detailed explanation |
| `category` | String | Maintenance domain (Electrical, Plumbing, Wi-Fi, etc.) |
| `location` | String | Exact location (e.g. Washroom stall 2, Room 302 desk) |
| `hostel` | String | Hostel name |
| `block` | String | Hostel block |
| `roomNumber` | String | Hostel room |
| `priority` | String | `Low`, `Medium`, `High`, `Urgent` |
| `status` | String | `Pending`, `Assigned`, `In Progress`, `Resolved`, `Rejected` |
| `submittedBy` | ObjectId | Reference to `User` |
| `assignedTo` | Object | Assigned staff details and timestamp |
| `adminRemarks` | String | Notes from supervisor / warden |
| `resolution` | Object | Notes and timestamp of resolution |
| `rejectionReason`| String | Reason if marked rejected |
| `timeline` | Array | Chronological log of all status transitions & remarks |

### 3. Category (`models/Category.js`)
| Field | Type | Description |
|---|---|---|
| `name` | String | Unique category title |
| `description` | String | Description of covered issues |
| `isActive` | Boolean | Availability flag for student forms |

### 4. Notification (`models/Notification.js`)
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Target student or administrator |
| `title` | String | Notification headline |
| `message` | String | Detailed update notice |
| `type` | String | `complaint_created`, `status_updated`, `assigned`, `resolved`, `rejected` |
| `complaint` | ObjectId | Associated complaint reference |
| `isRead` | Boolean | Read state |

---

## Authentication & Role-Based Authorization

1. **JWT Authentication**: Users receive an HTTP Bearer JWT upon valid login/registration.
2. **Client State**: Token and user info are stored securely and automatically attached via Axios interceptors.
3. **Protected Routes**:
   - Students cannot view or call `/admin/*` routes (Returns HTTP 403 / Redirects to `/student/dashboard`).
   - Wardens cannot submit complaints as students.
   - Unauthenticated visitors attempting protected paths are redirected to `/login`.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or v20+ recommended)
- npm (v9+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd server
npm install
```

Configure `server/.env` (a ready `.env` has already been created):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_complaints
JWT_SECRET=hostel_complaint_jwt_super_secret_key_2026_safe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Database Seeding & Admin Creation

Run the seed script to automatically create:
- All 9 standard maintenance categories
- Chief Hostel Warden admin account
- 3 sample resident students
- Sample complaints in various statuses (`Pending`, `In Progress`, `Resolved`)
- Activity log timelines and notifications

```bash
cd server
npm run seed
```

### 3. Frontend Setup

```bash
cd client
npm install
```

---

## Running the Application

### Start Backend Server:
```bash
cd server
npm run dev
# Server will run at http://localhost:5000
```

### Start Frontend Client:
```bash
cd client
npm run dev
# Frontend will run at http://localhost:5173
```

Visit **http://localhost:5173** in your web browser.

---

## Demo Credentials for Viva / Testing

You can use the **Quick Demo Fill** buttons on the Login Page, or enter manually:

### 🛡️ Warden / Admin Account:
- **Email**: `admin@hostel.com`
- **Password**: `Admin@123`
- **Access**: Complete Warden Dashboard, Triage Master Directory, Category Management, Student Directory.

### 🎓 Student Accounts:
- **Student 1 (Rahul Sharma)**:
  - **Email**: `rahul.sharma@hostel.com` (or ID: `STU2024001`)
  - **Password**: `Student@123`
  - **Hostel**: Aryabhatta Hall, B Block, Room 302
- **Student 2 (Priya Patel)**:
  - **Email**: `priya.patel@hostel.com` (or ID: `STU2024002`)
  - **Password**: `Student@123`
  - **Hostel**: Gargi Bhavan, A Block, Room 114

---

## REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register student account |
| POST | `/api/auth/login` | Public | Login via Email or Student ID |
| POST | `/api/auth/logout` | Private | Clear session |
| GET | `/api/auth/me` | Private | Retrieve logged-in profile |
| PUT | `/api/auth/profile` | Private | Update user contact details |
| PUT | `/api/auth/change-password` | Private | Change password with bcrypt verification |

### Student Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/complaints` | Student | Submit new complaint with optional photo |
| GET | `/api/complaints` | Student | View student's complaints (supports search & filter) |
| GET | `/api/complaints/:id` | Private | Get single complaint by ID (Student owner or Admin) |
| PUT | `/api/complaints/:id` | Student | Edit complaint (Pending only) |
| DELETE | `/api/complaints/:id` | Student | Cancel complaint (Pending only) |

### Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Aggregate statistics and critical alerts |
| GET | `/api/admin/complaints` | Admin | Master complaints directory (filter, sort, search) |
| PUT | `/api/admin/complaints/:id/status` | Admin | Change status & log remarks |
| PUT | `/api/admin/complaints/:id/assign` | Admin | Assign technician / maintenance staff |
| PUT | `/api/admin/complaints/:id/resolve` | Admin | Mark resolved with notes |
| PUT | `/api/admin/complaints/:id/reject` | Admin | Reject with justification |
| GET | `/api/admin/students` | Admin | Student directory with complaint counts |
| GET | `/api/admin/students/:id` | Admin | Detailed student profile and history |

### Categories & Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/categories` | Public/Private | Retrieve categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete/deactivate category |
| GET | `/api/notifications` | Private | User's notifications |
| GET | `/api/notifications/unread-count` | Private | Unread notification count |
| PUT | `/api/notifications/read-all` | Private | Mark all notifications read |
| PUT | `/api/notifications/:id/read` | Private | Mark single notification read |

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "feat: complete hostel complaint management system"
git branch -M main
git remote add origin https://github.com/<your-username>/hostel-complaint-management.git
git push -u origin main

```
<img width="1912" height="1077" alt="image" src="https://github.com/user-attachments/assets/11d98043-4cfb-4e2c-b029-7463a6d1f0e5" />

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/d92400c1-9e77-47ee-8391-38a0800931b8" />
