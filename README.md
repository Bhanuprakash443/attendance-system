# Employee Attendance System - Frontend

A React-based attendance tracking system with mock data stored in localStorage.

## Features

### Employee Features
- ✅ Register/Login
- ✅ Mark attendance (Check In / Check Out)
- ✅ View attendance history (calendar and table view)
- ✅ View monthly summary (Present/Absent/Late days)
- ✅ Dashboard with stats

### Manager Features
- ✅ Login
- ✅ View all employees attendance
- ✅ Filter by employee, date, status
- ✅ View team attendance summary
- ✅ Export attendance reports (CSV)
- ✅ Dashboard with team stats

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Storage**: localStorage (mock data)

## Prerequisites

- Node.js 18+ and npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd swift-web-launch-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application

**Development mode:**

```bash
npm run dev
```

The application will be available at http://localhost:8080

**Production build:**

```bash
npm run build
npm run preview
```

## Deployment on Render

### Quick Deploy

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Settings**
   - **Name**: attendance-system (or your choice)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: Static Site

3. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy

### Alternative: Using render.yaml

The project includes a `render.yaml` file. You can:
- Push to GitHub
- Render will automatically detect and deploy

## Default Login

**Manager:**
- Email: `manager@example.com`
- Password: `manager123`

**Employee:**
- Email: `john@example.com`
- Password: `employee123`

**Note**: On first load, you'll need to register. Data is stored in browser localStorage.

## Project Structure

```
swift-web-launch-main/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities and API client (mock)
│   └── ...
├── public/             # Static assets
└── package.json        # Dependencies
```

## Data Storage

All data is stored in browser localStorage:
- Users: `attendance_users`
- Attendance: `attendance_attendance`
- Current user: `user`
- Auth token: `token`

**Note**: Data is browser-specific and will be cleared if localStorage is cleared.

## Build for Production

```bash
npm run build
```

Output will be in the `dist` folder, ready for static hosting.

## License

MIT
