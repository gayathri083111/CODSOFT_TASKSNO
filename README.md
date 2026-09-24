# EduManage – Student Management System

A modern, full-stack centralized education management platform designed to streamline institutional operations. EduManage provides dedicated role-based portals for **Administrators**, **Faculty/Teachers**, and **Students**, delivering real-time management of student and faculty directories, lecture attendance, examination grading, tuition fee ledgers, and official academic records.

Developed as part of the **CodSoft Full-Stack Web Development Internship (Task 1)**.

---

## Table of Contents

1. [Features](#features)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Architecture](#database-architecture)
6. [Prerequisites](#prerequisites)
7. [Installation and Setup](#installation-and-setup)
8. [Environment Variables](#environment-variables)
9. [How to Run Locally](#how-to-run-locally)
10. [Demo Credentials](#demo-credentials)
11. [Screenshots](#screenshots)
12. [Future Improvements](#future-improvements)
13. [Internship Information](#internship-information)
14. [Author](#author)

---

## Features

### 🔐 Authentication & Role Isolation

- **Dedicated Role Portals**: Independent workflows for Administrator, Teacher, and Student roles.
- **Secure Authentication**: Credential-based authentication with password hashing and signed session tokens.
- **Role-Based Access Control (RBAC)**: Client-side route guards combined with server-side middleware to prevent unauthorized cross-role access.

### 🏛️ Administrator Portal

- **Dashboard Analytics**: High-level institutional metrics including total enrollment, active faculty, average attendance rates, fee collection totals, and pending dues.
- **Student Management (Full CRUD)**: Add, edit, view, filter, search, and delete student records with department, course, section, and guardian details.
- **Teacher Management (Full CRUD)**: Maintain faculty records, assign departments, specify designations, and link subject workloads.
- **Attendance Monitoring**: Institutional attendance audit logs filterable by date, course, subject, and attendance status.
- **Examination Governance**: Create and schedule examinations (Mid-Term, Final Semester, Unit Tests, Practicals) with total and passing score thresholds.
- **Fee Management**: Create tuition and fee invoices, track paid vs. pending balances, review payment modes, and issue receipt numbers.
- **Academic Standing Records**: Monitor student GPA, CGPA, completed credits, and institutional academic standings (Dean's List, Good Standing, Academic Probation).

### 👨‍🏫 Teacher / Faculty Portal

- **Assigned Student Rosters**: View students enrolled in classes assigned to the instructor.
- **Daily Attendance Roll Call**: Single-click interactive attendance marker with status toggles (PRESENT, ABSENT, LATE, EXCUSED) and batch submission.
- **Examination Marks Entry**: Enter scores for assigned subjects with automated percentage calculation, letter-grade generation (A+, A, B, C, F), and evaluative remarks.
- **Academic Performance Overview**: Review class-wide grade distributions and student academic growth.

### 🎓 Student Scholar Portal

- **Personal Profile**: View institutional enrollment details, student ID, roll number, department, course, and contact information.
- **Real-Time Attendance Tracker**: Monitor lecture attendance percentages against the mandatory 75% attendance threshold with status breakdowns.
- **Examination Scorecards**: View official semester examination results, marks obtained, total marks, and letter grades.
- **Tuition & Fee Ledger**: Inspect invoices, outstanding balances, payment dates, transaction modes, and payment receipts.
- **Academic Transcript & CGPA**: Track cumulative CGPA, semester GPA, and earned credits toward degree completion.

### 🎨 User Interface & Experience

- **Visual Design**: Professional, clean institutional UI built with Tailwind CSS.
- **Responsive Layout**: Optimized for desktop monitors, laptops, tablets, and mobile devices.
- **Interactive Feedback**: Modal forms, search bars, filter dropdowns, and status badges.

---

## User Roles and Permissions

| **Feature / Module** | **Administrator** | **Teacher** | **Student** |
|---|---|---|---|
| **Institutional Overview & Analytics** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **Manage Students (Add/Edit/Delete)** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **Manage Faculty (Add/Edit/Delete)** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **View Assigned Student Rosters** | ✅ All Students | ✅ Assigned Classes | ❌ Restricted |
| **Mark & Update Daily Attendance** | ✅ Full Access | ✅ Assigned Subjects | ❌ Restricted |
| **View Attendance Records** | ✅ All Batches | ✅ Assigned Subjects | ✅ Own Records Only |
| **Create & Schedule Examinations** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **Enter / Publish Examination Marks** | ✅ Full Access | ✅ Assigned Subjects | ❌ Restricted |
| **View Examination Results** | ✅ All Results | ✅ Assigned Subjects | ✅ Own Results Only |
| **Fee Ledger & Payment Tracking** | ✅ Full Access | ❌ Restricted | ✅ Own Fees Only |
| **Academic Transcripts & Standings** | ✅ Full Access | ✅ View Roster | ✅ Own Record Only |

---

## Technology Stack

### Frontend

- **React 19**: Modern UI library with functional components and hooks.
- **TypeScript**: Static typing for data integrity and maintainable code.
- **Vite**: High-speed build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for clean, responsive styling.
- **Lucide React**: Icon pack for dashboards and navigation menus.

### Backend

- **Node.js**: Server-side JavaScript runtime environment.
- **Express.js**: RESTful API server routing and middleware pipeline.
- **JSON Web Tokens (JWT)**: Stateless token-based session handling.
- **Crypto**: Secure hashing for password verification.

### Database & ORM

- **PostgreSQL**: Robust relational database for educational records.
- **Prisma ORM**: Type-safe database client, declarative schema migrations, and relational queries.

### Version Control & Tooling

- **Git & GitHub**: Version control and repository management.
- **tsx**: TypeScript execution engine for the unified full-stack server.

---

## Project Structure

```text
edumanage/
├── prisma/
│   ├── schema.prisma          # Relational PostgreSQL schema definition
│   └── seed.ts                # Database seeding script with sample data
├── src/
│   ├── components/
│   │   ├── admin/             # Administrator portal components
│   │   │   ├── AdminAcademicRecords.tsx
│   │   │   ├── AdminAttendance.tsx
│   │   │   ├── AdminExaminations.tsx
│   │   │   ├── AdminFees.tsx
│   │   │   ├── AdminOverview.tsx
│   │   │   ├── AdminStudents.tsx
│   │   │   └── AdminTeachers.tsx
│   │   ├── auth/              # Authentication & login interfaces
│   │   │   └── LoginPage.tsx
│   │   ├── common/            # Shared UI components (Header, Sidebar, Modals, StatCards)
│   │   │   ├── Header.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatCard.tsx
│   │   ├── student/           # Student self-service portal components
│   │   │   ├── StudentAcademicRecords.tsx
│   │   │   ├── StudentAttendance.tsx
│   │   │   ├── StudentFees.tsx
│   │   │   ├── StudentOverview.tsx
│   │   │   ├── StudentProfile.tsx
│   │   │   └── StudentResults.tsx
│   │   ├── teacher/            # Faculty portal components
│   │   │   ├── TeacherAcademicRecords.tsx
│   │   │   ├── TeacherAttendance.tsx
│   │   │   ├── TeacherMarks.tsx
│   │   │   ├── TeacherOverview.tsx
│   │   │   └── TeacherStudents.tsx
│   │   └── RoleSelection.tsx   # Initial landing & role selection screen
│   ├── context/
│   │   └── AuthContext.tsx     # React authentication context & session state
│   ├── server/
│   │   └── db.ts               # Database service & operational data layer
│   ├── api.ts                  # Frontend HTTP API client
│   ├── App.tsx                 # Main app router & role route guards
│   ├── index.css               # Global styles & Tailwind imports
│   ├── main.tsx                # Client entry point
│   └── types.ts                # Shared TypeScript models & interfaces
├── .env.example                # Template for environment variables
├── index.html                  # HTML application template
├── package.json                # Dependencies and build scripts
├── server.ts                   # Express API server with Vite middleware integration
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundler configuration