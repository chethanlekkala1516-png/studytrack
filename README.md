# StudyTrack — Student Daily To-Do List & Productivity Tracker

> 🎓 A modern, full-stack student productivity suite built for academic success. Organize coursework, track assignment deadlines, log Pomodoro focus sessions, and monitor productivity streaks with real SQLite persistence.

---

## 🌟 Problem Statement & Overview

College students, particularly in their first year, juggle heavy course loads across multiple subjects (Calculus, Data Structures, Physics, Chemistry, etc.). Standard generic to-do apps lack academic context:
- They don't link study time directly to upcoming deadlines.
- They don't provide automated deadline warnings or overdue alerts.
- They lack Pomodoro focus sessions that sync with daily productivity goals.
- They don't show real visual progress on completion streaks.

**StudyTrack** bridges this gap by combining an academic task manager, interactive calendar planner, customizable Pomodoro focus timer, and visual analytics engine in one cohesive application.

---

## 🚀 Key Features

### 1. 🔐 Secure Student Authentication & Isolation
- Student registration, login, and logout.
- Password hashing using `bcryptjs` (salt rounds: 10).
- Secure JWT authentication supporting both HttpOnly cookies and Bearer tokens.
- Strict multi-tenant data isolation: every task, reminder, session, and goal is scoped strictly by `user_id`. No student can see or edit another student's data.

### 2. 📋 Comprehensive Academic Task Manager
- Create, view, edit, and delete tasks.
- Fields: Title, Subject (Computer Science, Mathematics, Physics, etc.), Priority (High, Medium, Low), Status (Pending, In Progress, Completed), Due Date & Time, Estimated Study Duration, and Notes.
- Search tasks by keywords in title, description, or notes.
- Multi-filtering by Subject, Status, and Priority.
- Sorting by Deadline, Priority, Date Created, or Title.
- Pagination for large task lists.
- Overdue and upcoming deadline indicators with warning badges.
- One-click task completion and reopening.

### 3. 📊 Live Productivity Dashboard
- Real-time welcome greeting with student's name and current date.
- Key KPI cards: Total Tasks, Due Today, Overdue Tasks, Total Study Time.
- Daily Target Progress: circular/linear progress bars for tasks and study minutes.
- Active Study Streak: consecutive-day completion flame counter.
- Interactive Recharts: Weekly Task Productivity (Bar Chart) & Study Time Trends (Area Chart).
- Today's schedule with one-click completion checkboxes.
- Real-time activity log from SQLite records.

### 4. 📅 Academic Calendar & Planner
- **Month View**: Grid of all days displaying task chips color-coded by priority.
- **Week View**: 7-day breakdown of scheduled assignments.
- **Day View**: Detailed daily planner timeline.
- Click any task to inspect, modify, or reschedule.
- Jump to today or navigate between previous and next periods.

### 5. ⏱️ Focus Pomodoro Timer
- Configurable intervals: Focus (default 25m), Short Break (5m), Long Break (15m).
- Visual countdown with SVG progress ring.
- Link timer sessions directly to any pending student assignment.
- Start, pause, resume, and reset controls with audio chime alert on completion.
- Saves completed focus blocks directly to SQLite database.
- Shows today's focus minutes, total cumulative study time, and session log history.

### 6. 📈 Deep Productivity Analytics
- Subject-wise distribution (Interactive Recharts Pie Chart).
- Priority distribution (High, Medium, Low breakdown).
- 30-day cumulative focus study trends.
- Tabular study session history log with dates, types, and linked tasks.

### 7. 🔔 In-App Reminders & Notification Center
- Automatic deadline detection: flags overdue tasks and tasks due within 24 hours.
- Read/unread status indicators.
- One-click "Mark All as Read".
- Top navigation bar notification bell with unread badge count.

### 8. ⚙️ Student Settings & Dark Mode
- Customize display name and view account info.
- Change password with verification.
- Adjust daily goals (daily task target & daily focus minutes target).
- Configure default Pomodoro durations.
- Timezone selector.
- Full Light and Dark Mode toggle.

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Fast, responsive Single Page Application (SPA) |
| **Language** | JavaScript (ESModules & CommonJS) | Clean, accessible code for beginners and judges |
| **Styling** | Modern Responsive CSS | Navy blue, indigo, and slate palette with full Dark Mode |
| **Routing** | React Router v7 | Protected routes, layout outlets, clean URLs |
| **Backend** | Node.js + Express.js | Robust RESTful API architecture |
| **Database** | SQLite (`better-sqlite3` & native `node:sqlite`) | Zero-configuration, ACID compliant local SQL persistence |
| **Security** | `bcryptjs` + `jsonwebtoken` | Enterprise-grade password hashing and token validation |
| **Charts** | Recharts | Interactive responsive SVG data visualizations |
| **Testing** | Vitest + Supertest | 20 automated integration tests covering authentication, isolation, and CRUD |

---

## 📁 Folder Structure

```
studytrack/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskFormModal.jsx
│   │   ├── context/            # Global React State
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/              # Application Views
│   │   │   ├── Analytics.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FocusTimer.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Tasks.jsx
│   │   ├── services/
│   │   │   └── api.js          # Centralized API fetch wrapper
│   │   ├── App.jsx             # Route definitions & shell layout
│   │   ├── index.css           # Design tokens, variables & animations
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Vite configuration with API proxy
├── server/                     # Express Backend
│   ├── data/                   # SQLite database directory (studytrack.db)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Database initialization, schemas & seed
│   │   ├── controllers/        # REST Controllers
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── goalsController.js
│   │   │   ├── reminderController.js
│   │   │   ├── settingsController.js
│   │   │   ├── studySessionController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT & Cookie authentication guard
│   │   │   └── errorHandler.js # Centralized error handler
│   │   ├── routes/             # Express API routes
│   │   ├── app.js              # Express app assembly & static serving
│   │   └── server.js           # Server listen runner
│   ├── tests/
│   │   └── api.test.js         # Automated test suite
│   ├── .env                    # Local environment variables
│   ├── .env.example
│   ├── index.js                # Server entrypoint
│   └── package.json
├── .gitignore
├── package.json                # Root package runner
├── README.md                   # Complete documentation
├── start-dev.bat               # Windows 1-click Development Launcher
└── start.bat                   # Windows 1-click Production Launcher
```

---

## ⚡ Prerequisites

- **Node.js**: v18.0.0 or higher (Tested and verified on Node v24)
- **npm**: v9.0.0 or higher
- **Operating System**: Windows, macOS, or Linux

---

## 💻 Installation & Setup

### 1. Clone or Open the Repository
```bash
cd studytrack
```

### 2. Configure Environment Variables
A default `.env` is already configured in `server/.env`. If creating a new one:
```bash
cp server/.env.example server/.env
```
Default `.env` contents:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=studytrack_super_secret_jwt_key_hackathon_2026
CLIENT_ORIGIN=http://localhost:5173
DB_PATH=./data/studytrack.db
```

### 3. Install Dependencies
Install server dependencies:
```bash
cd server
npm install
cd ..
```

Install client dependencies:
```bash
cd client
npm install
cd ..
```

---

## 🏃 Running the Application

### Option A: 1-Click Launchers (Windows)
Double-click either batch file in the root folder:
- **`start-dev.bat`**: Starts both backend (port 5000) and frontend (port 5173 with Vite hot-reload), and opens your browser.
- **`start.bat`**: Builds the frontend into `client/dist` and runs everything from the unified Express server on `http://localhost:5000`.

### Option B: Terminal Commands

#### 1. Start the Backend Server (Terminal 1)
```bash
cd server
npm start
```
*The backend server will run on `http://localhost:5000`.*

#### 2. Start the Frontend Development Client (Terminal 2)
```bash
cd client
npm run dev
```
*Open `http://localhost:5173` in your web browser.*

---

## 🧪 Automated Testing

We have built a comprehensive test suite in `server/tests/api.test.js` using Vitest and Supertest.

To run the automated tests:
```bash
cd server
npm test
```

### Test Coverage Highlights:
- ✅ **API Health Check**: Verifies `/api/health` response.
- ✅ **Student Signup**: Creates account with password hashing.
- ✅ **Duplicate Email Prevention**: Returns 409 Conflict.
- ✅ **Invalid Credentials**: Rejects wrong passwords with 401 Unauthorized.
- ✅ **Authentication**: Validates JWT and retrieves student profile via `/api/auth/me`.
- ✅ **Unauthorized Protection**: Blocks access to protected endpoints without token.
- ✅ **User Data Isolation**: Confirms User B cannot view, modify, or delete User A's tasks or records.
- ✅ **Task CRUD**: Creates, filters, updates status to Completed, and deletes tasks.
- ✅ **Input Validation**: Rejects missing required task fields.
- ✅ **Study Sessions & Stats**: Logs focus sessions and verifies minutes aggregation.
- ✅ **Goals & Streaks**: Verifies streak calculation and daily target updates.

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/signup`: Register new student `{ name, email, password }`
- `POST /api/auth/login`: Authenticate student `{ email, password }`
- `POST /api/auth/logout`: Clear authentication cookie
- `GET /api/auth/me`: Get current authenticated profile and settings

### Tasks
- `GET /api/tasks`: List tasks (supports `search`, `subject`, `status`, `priority`, `date`, `sortBy`, `sortOrder`, `page`, `limit`)
- `POST /api/tasks`: Create task `{ title, description, subject, priority, due_date, estimated_duration, notes }`
- `GET /api/tasks/:id`: Get task by ID
- `PATCH /api/tasks/:id`: Update task fields
- `DELETE /api/tasks/:id`: Delete task

### Reminders
- `GET /api/reminders`: List active reminders and unread counter
- `PATCH /api/reminders/:id`: Mark individual reminder as read
- `POST /api/reminders/read-all`: Mark all reminders as read

### Study Sessions
- `GET /api/study-sessions`: List recent study sessions and total minutes
- `POST /api/study-sessions`: Record study session `{ duration_minutes, session_type, task_id }`

### Analytics
- `GET /api/analytics/summary`: Aggregate metrics (totals, completed today, overdue, streak)
- `GET /api/analytics/weekly`: 7-day productivity & study minutes breakdown
- `GET /api/analytics/monthly`: Subject breakdown, priority breakdown, and 30-day study trend

### Goals
- `GET /api/goals`: Retrieve today's goal progress, streak counters, and recent history
- `PUT /api/goals`: Update daily targets `{ targetTasks, targetMinutes }`

### Settings
- `GET /api/settings`: Get user settings
- `PATCH /api/settings`: Update settings `{ name, theme, daily_task_goal, daily_study_minutes_goal, focus_duration, ... }`

---

## 🎓 Hackathon Demo Walkthrough

To test or demo the application during evaluations:

1. **Launch the Application**: Run `start-dev.bat` or `npm run dev`.
2. **One-Click Demo Login**:
   - On the `/login` page, click the **"Use Demo"** button.
   - It will auto-fill:
     - **Email**: `alex.study@example.com`
     - **Password**: `password123`
   - Click **"Sign In to StudyTrack"**.
3. **Explore Dashboard**:
   - Notice the live streak counter, daily goal progress bar, weekly productivity bar chart, and study minutes trend.
4. **Try Task Management**:
   - Go to **"My Tasks"** in the sidebar.
   - Search by keyword (e.g., "Calculus" or "C++").
   - Filter by Subject (e.g., "Computer Science").
   - Click the checkmark to mark a task as Completed (watch it cross off with an animation!).
   - Click the "+ New Task" button to create an assignment.
5. **Inspect the Academic Calendar**:
   - Switch between Month, Week, and Day planner views.
   - Click any task to inspect details or reschedule the deadline.
6. **Experience the Focus Timer**:
   - Select a task from the dropdown and click **"Start Focus"**.
   - Notice the SVG countdown ring and session log history.
7. **Check Analytics**:
   - View subject-wise task allocation (Pie Chart) and priority distribution (Bar Chart).
8. **Toggle Dark Mode**:
   - Click the Sun / Moon icon in the top navigation bar to switch between clean Navy/Indigo Light and Dark modes.

---

## 🛡️ Security & Privacy Notes

- **Password Storage**: Plaintext passwords are never stored. Passwords are salted and hashed using bcrypt.
- **Data Isolation**: User IDs are never trusted from the client payload. The backend always extracts `req.user.id` from the cryptographically verified JWT token.
- **SQL Injection Prevention**: All queries use parameterized SQL statements (`?` parameters) via native SQLite statements.
- **XSS & CORS**: Strict CORS origin validation and sanitization on all inputs.
- **Notifications Scope**: In-app notifications are calculated and displayed while the student has the application open. Background web push without user consent is intentionally avoided to preserve student privacy and local execution independence.

---

## 🤝 Known Limitations

- **Browser Closed Notifications**: In-app reminders trigger dynamically when the web app is active. Operating system background push notifications require configuring external service worker push keys (e.g. Firebase or Web Push VAPID).
- **Multi-Device Cloud Sync**: The default configuration stores data in local SQLite (`studytrack.db`). For multi-server cloud deployment, PostgreSQL or a distributed SQLite layer can be connected using the same repository interfaces.

---

## 📄 License
This project is licensed under the ISC License. Built with ❤️ for student academic achievement.
"# studytracklckr1234" 
#   s t u d y t r a c k l c k r 1 2 3 4  
 "# studytracklckr1234" 
"# studytrack" 
#   T O - D O - L I S T - B Y - C D K  
 #   T O - D O - L I S T - B Y - C D K  
 