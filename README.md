# Gym-Log 🏋️‍♂️

![Version](https://img.shields.io/badge/version-2.1.2-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-enabled-blueviolet?style=for-the-badge&logo=pwa&logoColor=white)
![Offline](https://img.shields.io/badge/offline--first-yes-orange?style=for-the-badge)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)

A robust, **Offline-First** Progressive Web App (PWA) for tracking daily gym attendance. Mark yourself as Present or Absent each day, review your stats, and stay consistent — even without internet.

---

## ✨ Features

- **Daily Attendance** — Tap Present or Absent each day with one click
- **Calendar View** — Month-by-month color-coded calendar (green = Present, red = Absent)
- **Stats Dashboard** — Consistency Score, Monthly Breakdown, Current Streak with tier badges
- **Offline-First Sync** — CRDT-lite engine (Last-Write-Wins) with bi-directional sync. Works without internet, syncs when back online
- **Edit Mode** — PIN-protected (60s timed sessions) to correct past dates
- **Dark Mode** — System-aware toggle with full theme support
- **Excel Export** — Download a styled `.xlsx` report with Dashboard summary + Daily Log
- **PWA Installable** — Add to home screen on any device
- **Changelog Modal** — Automatically shows what's new after each update
- **Error Boundary** — Global crash protection, no more white screens

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 3 |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose 9) |
| Offline Storage | IndexedDB (idb-keyval) |
| PWA | vite-plugin-pwa, Workbox |
| Security | Helmet, express-rate-limit |
| Icons | Heroicons v2 |
| Export | ExcelJS + file-saver |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (Atlas cloud or local instance)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/gym-track-pwa.git
cd gym-track-pwa
```

### 2. Install dependencies

```bash
# Root (installs concurrently)
npm install

# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `server/` folder:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 4. Run in development

From the **root** folder, one command starts everything:

```bash
npm run dev
```

This launches:
- **Server** (nodemon) on `http://localhost:5000`
- **Client** (Vite) on `http://localhost:5173`

### 5. Build for production

```bash
npm run build
```

Then start the production server:

```bash
npm run start
```

The Express server serves the built client from `client/dist` at `http://localhost:5000`.

---

## 📡 Sync Architecture (v2.1.0)

Gym-Log uses a **CRDT-lite Last-Write-Wins** strategy for offline sync:

- Every edit carries a timestamp (`updatedAt`) and device fingerprint (`deviceId`)
- A single `POST /api/attendance/sync` endpoint handles bi-directional data exchange
- The server uses **atomic MongoDB BulkWrite** operations to enforce LWW at the database level
- A **24-hour clock-drift guard** prevents faulty timestamps from corrupting data
- The client stores data in IndexedDB and queues offline changes for sync on reconnection
- **Retry with backoff** — failed syncs retry up to 3 times (3s → 9s → 27s)
- **Cross-device reset** — resetting history on one device propagates to all others via a `SyncMeta` breadcrumb

---

## 📁 Project Structure

```
gym-track-pwa/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # UI components (dashboard, layout, modals, ui)
│   │   ├── hooks/        # useAttendance, useSyncEngine, useEditSession
│   │   ├── services/     # API client (Axios)
│   │   ├── utils/        # syncManager, dateHelpers, exportHelper
│   │   └── pages/        # Dashboard (single page app)
│   └── package.json
├── server/               # Express backend
│   ├── controllers/      # syncController, attendanceController
│   ├── models/           # Attendance, SyncMeta (Mongoose schemas)
│   ├── routes/           # attendanceRoutes
│   └── server.js
├── package.json          # Root (concurrently dev script)
├── ai_context.md         # AI developer blueprint
├── CHANGELOG.md
└── README.md
```

---

## 📄 License

© 2026 Gym-Log. Built with ❤️ for consistency.