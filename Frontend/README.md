# Veriton LMS - Frontend Documentation

Welcome to the **Veriton Learning Management System (LMS)** frontend. This is a premium, state-of-the-art React application built with **TypeScript**, **Vite**, and **Tailwind CSS**.

## 🚀 Overview
The frontend is designed for high-performance institutional governance, providing a seamless experience for Admins, Principals, Teachers, Staff, and Students. It features a dynamic role-based UI, premium aesthetics, and complete integration with the Veriton .NET Web API.

---

## 🔐 Role-Based Authentication & Redirection

The application implements a smart redirection logic upon login, ensuring users land on the most relevant page for their specific role.

### Login Redirection Mapping:
| User Role | Dashboard Landing Page | Logical Reason |
| :--- | :--- | :--- |
| **SuperAdmin/Admin** | `/schools` | Needs an bird's-eye view of all registered institutions. |
| **Principal** | `/schools` | Lands on their specific school's management interface. |
| **Teacher** | `/students` | Designed to immediately start managing classroom attendance and profiles. |
| **Staff/Student** | `/` (Dashboard) | General overview of academic performance and metrics. |

---

## 📂 Role-Wise Sidebar & Dashboard Sections

Navigation is dynamically generated based on the user's `utype`. Each role sees only the sections relevant to their permissions and tasks.

### 1. 🛡️ Admin (SuperAdmin / Admin)
Full system visibility and global management.
- **Dashboard**: Global system statistics.
- **Schools**: Register and manage multiple institutions.
- **Teachers**: Global faculty registry.
- **Students**: Global student registry.
- **Users Approval**: Manage and approve new staff and principal accounts.

### 2. 🏛️ Principal (Principle)
Focused on school-level governance and curriculum management.
- **Dashboard**: School-specific performance metrics.
- **My School**: Institutional details and settings.
- **Grades**: Manage grade levels (e.g., Grade 10-A, 11-B).
- **Faculty**: Manage teachers within their specific school.
- **Students**: Oversee student enrollment for their school.

### 3. 💼 Staff
Administrative support for school operations.
- **Dashboard**: Operational stats.
- **Schools**: View and update school information.
- **User Management**: Assist in managing user profiles and basic configurations.

### 4. 🍎 Teacher
Classroom and lesson management.
- **My Dashboard**: Personal classroom statistics.
- **My Students**: Access to students in assigned grades.
- **My Classes**: Manage grades and sections currently being taught.

### 5. 🎓 Student
Personal academic portal.
- **Overview**: Personal attendance and performance summary.
- **My Courses**: Access to curriculum modules and lessons.

---

## 🛠️ Technical Stack
- **Framework**: React 18 + Vite (for lightning-fast HMR)
- **Language**: TypeScript (strict type safety)
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: React Hooks + Local Storage (Auth persistence)
- **API Client**: Axios (with interceptors for JWT injection)

## 📡 API Integration
The frontend communicates with the backend using snake_case properties to ensure compatibility with modern API standards:
- `first_name`, `last_name`, `full_name`, `school_id`, `utype`.

## 🚦 Getting Started
1. Install dependencies: `npm install`
2. Configure `.env`: Set `VITE_API_URL=http://localhost:5000/api`
3. Run Development Server: `npm run dev`
