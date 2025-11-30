🏢 Employee Attendance Management System
SDE Internship Project – Tap Academy (2026 Graduates)

Name: Katasani Bhanu Prakash Reddy
College: Mohan Babu University
Contact: 6302425361

📌 Project Overview

This is a full-stack Employee Attendance Tracking System built as part of the Tap Academy Second Round Interview Project.
The system provides separate dashboards for Employees and Managers, enabling attendance tracking, reporting, summary analytics, and CSV export.

🚀 Tech Stack
Frontend

React.js

Redux Toolkit / Zustand

React Router

Axios

TailwindCSS / Material UI

Backend

Express.js (Fast, minimalist Node.js framework)

JWT Authentication

bcrypt.js (Password hashing)

Database

PostgreSQL

Prisma / Sequelize (ORM) (based on your implementation)

🎯 Features
👨‍💼 Employee Features

Register / Login

Check-In & Check-Out

View Today’s Attendance

Monthly Summary (Present/Absent/Late)

Attendance Calendar View (Color-coded)

Recent 7-day attendance

Total monthly hours

Profile page

🧑‍🏫 Manager Features

Login

View attendance of all employees

Filter (employee, date, status)

Team attendance summary

Today’s present/absent/late employees

Export attendance as CSV

Department-wise & weekly trend charts

Team calendar view

🧩 Database Schema (PostgreSQL)
Users Table
Column	Type	Description
id	UUID	Primary Key
name	VARCHAR	Employee name
email	VARCHAR	Unique
password	VARCHAR	Hashed
role	VARCHAR	employee / manager
employeeId	VARCHAR	Unique EMPxxx
department	VARCHAR	Department name
createdAt	TIMESTAMP	Auto
Attendance Table
Column	Type	Description
id	UUID	Primary Key
userId	UUID	Foreign Key (Users)
date	DATE	Attendance date
checkInTime	TIME	Check-in
checkOutTime	TIME	Check-out
status	VARCHAR	present/absent/late/half-day
totalHours	DECIMAL	Daily hours worked
createdAt	TIMESTAMP	Auto
🌐 API Endpoints
🔐 Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register employee
POST	/api/auth/login	Login
GET	/api/auth/me	Get logged user info
👨‍💼 Employee Attendance APIs
Method	Endpoint	Description
POST	/api/attendance/checkin	Mark Check-In
POST	/api/attendance/checkout	Mark Check-Out
GET	/api/attendance/my-history	My attendance
GET	/api/attendance/my-summary	Monthly summary
GET	/api/attendance/today	Today’s status
🧑‍🏫 Manager Attendance APIs
Method	Endpoint	Description
GET	/api/attendance/all	View all employees
GET	/api/attendance/employee/:id	Specific employee data
GET	/api/attendance/summary	Team summary
GET	/api/attendance/export	Export CSV
GET	/api/attendance/today-status	Who is present today
📊 Dashboard APIs
Endpoint	Description
GET /api/dashboard/employee	Employee dashboard stats
GET /api/dashboard/manager	Manager dashboard stats
📊 Dashboard Requirements
Employee Dashboard Includes:

Today’s attendance status

Monthly summary

Total hours worked

Last 7 days table

Quick Check-In & Check-Out

Manager Dashboard Includes:

Total employees

Today’s present vs absent

Late arrivals

Weekly trend chart

Department-wise attendance

Absent employees list



🔧 Environment Variables

Create .env inside backend:

PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/attendance_db
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000

🛠️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/attendance-system.git
cd attendance-system

2️⃣ Backend Setup
cd backend
npm install
npm start

3️⃣ Frontend Setup
cd frontend
npm install
npm start


Backend → http://localhost:5000

Frontend → http://localhost:3000

🌱 Seed Data (Optional)

If seed script exists:

npm run seed


This will create:

1 Manager

Sample Employees

Sample Attendance Records




This README includes:

✔ Name: Bhanuprakash Katasani
✔ College Name: Mohan Babu University, Tirupati
✔ Contact Number: 6302425361




This project demonstrates a complete end-to-end real-world attendance workflow, suitable for production usage and fulfilling the  Project expectations.

Feel free to reach out for any clarification.

All the best for your interview! 🚀
