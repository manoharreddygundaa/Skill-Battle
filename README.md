# ⚔️ Skill Battle — Complete MERN Stack Application

> **A real-time competitive programming platform inspired by LeetCode, featuring a head-to-head 1v1 friend battle arena.** Built as a college capstone project.

---

## 🌟 Overview & Highlights

Skill Battle bridges traditional algorithmic practice with high-stakes, real-time multiplayer duels. Students can solve coding problems, maintain daily streaks, view an activity heatmap grounded in actual MongoDB submissions, earn achievement badges, and challenge friends to synchronized 1v1 coding battles.

### Two Role Ecosystem:
1. **Student Account**:
   - Algorithmic practice library with search, tags, and difficulty filters.
   - Interactive Monaco Code Editor with syntax highlighting (JavaScript & Python).
   - Real-time test runner (sample testcases) and full evaluation against hidden testcases.
   - Friend-to-Friend 1v1 Coding Battle: private room creation, shareable invite links, synchronized countdown timers, live opponent progress streaming, and authoritative backend winner determination.
   - LeetCode-inspired Profile: total solved ring, Easy/Medium/Hard progress bars, 365-day submission heatmap, current & max streaks, and achievement badges.
   - Daily Coding Challenge: consistent 24-hour challenge awarding bonus rating points.
2. **Admin Account**:
   - System telemetry: total students, problems, battles, and automated test submissions.
   - Problem Management: full CRUD for problem creation, editing, topic tagging, sample testcases, hidden testcases, and starter templates.
   - Student Management: account suspension and reactivation.
   - Daily Challenge Management: calendar scheduling for daily problems.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM, Monaco Editor (`@monaco-editor/react`), Socket.IO Client, Axios, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, express-validator |
| **Code Execution** | Configurable Judge0 API (RapidAPI) + High-performance Sandboxed Local Execution Engine (Node VM & Python runner with strict memory & execution limits) |

---

## 📁 Project Structure

```
skill-battle/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, env.js
│   │   ├── controllers/     # auth, problem, battle, dailyChallenge, profile, admin
│   │   ├── middleware/      # auth (JWT & role guards), validate, errorHandler
│   │   ├── models/          # User, Problem, Submission, Battle, DailyChallenge, Badge
│   │   ├── routes/          # auth, problem, battle, dailyChallenge, profile, admin
│   │   ├── services/        # codeExecutionService, streakService, badgeService
│   │   ├── socket/          # battleSocket.js (authoritative real-time 1v1 arena)
│   │   ├── utils/           # seedData.js, seed.js
│   │   └── server.js        # Express HTTP + Socket.IO server
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # common, editor, profile, battle
│   │   ├── context/         # AuthContext.jsx, SocketContext.jsx
│   │   ├── hooks/           # useAuth.js, useSocket.js
│   │   ├── layouts/         # MainLayout.jsx, AuthLayout.jsx
│   │   ├── pages/           # public, student, admin pages
│   │   ├── services/        # axios api client & endpoint services
│   │   ├── App.jsx          # Protected route definitions
│   │   ├── index.css        # Tailwind custom styles & charcoal design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or v20+) & **npm**
- **MongoDB** running locally on `mongodb://127.0.0.1:27017/skillbattle` (or MongoDB Atlas connection string)
- **Python** (optional, for running Python testcases locally)

### 2. Database Seeding
Open a terminal in the project directory:

```bash
cd backend
npm install
npm run seed
```

This seeds:
- 1 Admin account
- 2 Student demo accounts
- 7 Algorithmic coding problems (Easy, Medium, Hard) with sample and hidden test cases
- 8 Achievement badges
- Today's Daily Challenge
- 1 Completed demo 1v1 battle

---

## 🔑 Pre-Seeded Demonstration Accounts

For convenient evaluation and demonstration, use these accounts:

### Administrator Account
- **Email:** `admin@skillbattle.com`
- **Password:** `Admin@123`
- *Access:* Full Admin Console (`/admin`), problem creation/editing, student suspension, daily challenge scheduler.

### Student Account 1 (Host)
- **Email:** `student1@skillbattle.com`
- **Password:** `Student@123`
- *Access:* Practice library, 1v1 Battle creation, submissions heatmap, profile.

### Student Account 2 (Challenger)
- **Email:** `student2@skillbattle.com`
- **Password:** `Student@123`
- *Access:* Join battle room with code, compete in real time.

*(Quick 1-click test credential fill buttons are also available on the Login page!)*

---

## 🖥️ Running the Application Locally

### Terminal 1: Backend API & Socket Server
```bash
cd backend
npm install
npm run dev
```
> Server runs on `http://localhost:5000`

### Terminal 2: Frontend Client
```bash
cd frontend
npm install
npm run dev
```
> Client runs on `http://localhost:5173`

---

## ⚔️ 1v1 Friend Battle Flow

1. **Student A** clicks **"1v1 Battle"** or navigates to `/battle/create`.
2. Selects difficulty (`Easy`, `Medium`, `Hard`) and duration (e.g., 10 minutes).
3. The server generates a unique room code (e.g., `SB-PRO`) and private lobby URL (`http://localhost:5173/battle/SB-PRO`).
4. **Student B** enters the room via the invitation link or by entering the code at `/battle/join`.
5. Both students see the waiting lobby displaying avatars, ratings, and readiness status.
6. When both participants click **"I'm Ready"**, the host starts the battle.
7. Both players receive the identical problem and Monaco code editor.
8. The server runs an authoritative synchronized countdown timer.
9. As students run tests, the opponent's progress bar streams live test progress without revealing code or hidden cases.
10. The first student whose submission passes all hidden test cases is declared the **Winner**! If time runs out, the player who passed the most test cases wins, or a draw is recorded.
11. Results, ELO rating updates (+100 for win, -25 for loss), and past records are saved to MongoDB.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/skillbattle
JWT_SECRET=skill_battle_super_secret_jwt_key_2026_capstone_project
JWT_EXPIRES_IN=7d

# Optional Judge0 API keys (if left blank, Skill Battle uses its built-in sandbox engine!)
JUDGE0_API_URL=
JUDGE0_API_KEY=
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

