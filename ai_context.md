# Gym-Log — AI Context & Master Blueprint

> **Purpose:** This document is the single source of truth for any AI agent (or human developer) working on this project. It covers the app's purpose, architecture, data flow, current state, and strict developer workflow rules.

---

## 1. Project Overview

**Gym-Log** is a mobile-first Progressive Web App (PWA) that lets a single user track daily gym attendance. The core experience is simple: open the app each day, tap **"Present"** or **"Absent"**, and watch your stats build over time.

### Core Features (Current)
| Feature | Description |
|---|---|
| **Daily Mark** | Two large buttons to mark today as Present or Absent. Once marked, a status card replaces the buttons. |
| **Calendar View** | A month-by-month calendar where each day is color-coded green (Present) or red (Absent). Navigate between months freely. |
| **Stats Dashboard** | Three stat cards: **Consistency Score** (month vs lifetime %), **Monthly Breakdown** (workouts vs rest days), and **Current Streak** (with a motivational tier badge). |
| **Edit Mode** | PIN-protected (hardcoded `0000`) timed session (60s) that lets you tap past calendar dates and correct their status. Each date can only be edited once per session. |
| **Dark Mode** | System-aware toggle (stored in LocalStorage) that switches the entire UI between light and dark themes. |
| **Offline Support** | Works offline via a CRDT-lite sync engine (LWW strategy). Edits are saved to IndexedDB with timestamps and queued for sync. When connectivity returns, a bi-directional sync exchanges changes with the server in one round-trip. |
| **Excel Export** | Generates a styled `.xlsx` report (Dashboard summary + Daily Log sheets) using ExcelJS + file-saver. |
| **PWA Install** | Installable as a standalone app. Uses `vite-plugin-pwa` with a prompt-based update strategy. |
| **Changelog Modal** | Automatically displayed once per version update, showing the latest release notes from `data/changelog.js`. |
| **Settings Panel** | Slide-up drawer with theme toggle, export button, version info, and a "Danger Zone" to reset all history. |
| **Error Boundary** | Global `react-error-boundary` wrapper prevents white-screen crashes. |
| **Security** | Server uses Helmet (HTTP headers) and express-rate-limit (100 req / 15 min on `/api`). |

### Target User Experience
- **Mobile-first:** Max width capped at `max-w-md` (448px). Designed for phone use.
- **Fast & buttery:** Skeleton loaders during initial fetch, optimistic UI updates, smooth animations.
- **Works anywhere:** Full offline capability — mark attendance without internet, sync when back online.

---

## 2. Tech Stack

### Frontend (`/client`)
| Layer | Technology | Notes |
|---|---|---|
| Framework | **React 19** (Vite 7) | Single-page app, no router (single Dashboard page) |
| Styling | **Tailwind CSS 3** | `darkMode: 'class'`, custom font (Plus Jakarta Sans), custom animations (fade-in, slide-up, shake) |
| Icons | **Heroicons v2** | Outline and Solid variants |
| HTTP Client | **Axios** | Environment-aware base URL (relative in prod, `localhost:5000` in dev) |
| Offline Storage | **idb-keyval** (IndexedDB) | Stores records map (`gym-records`), sync queue (`gym-sync-queue`), sync cursor (`gym-last-sync-ts`), and device UUID (`gym-device-id`) |
| PWA | **vite-plugin-pwa** + **workbox-window** | `registerType: 'prompt'`, hourly update checks |
| Notifications | **react-hot-toast** | Bottom-center position, dark-mode aware |
| Export | **ExcelJS** + **file-saver** | Dynamically imported (code-split) |
| Error Handling | **react-error-boundary** | Wraps entire `<App />` in `main.jsx` |

### Backend (`/server`)
| Layer | Technology | Notes |
|---|---|---|
| Runtime | **Node.js** (CommonJS) | Entry: `server.js` |
| Framework | **Express 5** | REST API |
| Database | **MongoDB** via **Mongoose 9** | Cloud-hosted (connection string in `.env` as `MONGO_URI`) |
| Security | **Helmet 8** (CSP disabled) + **express-rate-limit 8** | Rate limit: 100 req / 15 min on `/api` |
| Dev Tool | **Nodemon** | Hot-reload during development |
| Env Config | **dotenv** | `.env` file at server root |

### Deployment
- Express serves the production `client/dist` build as static files with a catch-all `/*` route.
- Designed for single-service deployment (e.g., Render) where both API and frontend are served from the same process.

---

## 3. Architecture & Data Flow

### 3.1 Project Structure
```
gym-track-pwa-antigravity/
├── client/                         # React frontend (Vite)
│   ├── public/                     # PWA icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # StatsGrid, TodayStatusCard
│   │   │   ├── layout/             # Header, Footer
│   │   │   ├── modals/             # ChangelogModal, ConfirmDialog, EditStatusModal, PinModal, SettingsModal
│   │   │   └── ui/                 # ActionButtons, CalendarGrid, ErrorFallback, ReloadPrompt, SkeletonCard, StatCard, StatusBanner
│   │   ├── context/                # ThemeContext (dark mode)
│   │   ├── data/                   # changelog.js (in-app release notes)
│   │   ├── hooks/                  # useAttendance, useAttendanceStats, useEditSession, useSyncEngine
│   │   ├── pages/                  # Dashboard.jsx (the only page)
│   │   ├── services/               # api.js (Axios instance)
│   │   └── utils/                  # constants, dateHelpers, exportHelper, syncManager
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json                # Version: 2.1.1
├── server/
│   ├── config/db.js                # MongoDB connection
│   ├── controllers/syncController.js       # CRDT-lite sync endpoint
│   ├── controllers/attendanceController.js # Reset history (+ saves reset timestamp)
│   ├── models/Attendance.js        # Mongoose schema
│   ├── models/SyncMeta.js          # Mongoose schema for sync metadata (e.g., lastResetTimestamp)
│   ├── routes/attendanceRoutes.js
│   ├── server.js                   # Express entry point
│   ├── .env                        # MONGO_URI, PORT
│   └── package.json
├── CHANGELOG.md
├── README.md
└── ai_context.md                   # ← You are here
```

### 3.2 API Endpoints
| Method | Endpoint | Controller | Description |
|---|---|---|---|
| `POST` | `/api/attendance/sync` | `syncController.handleSync` | Bi-directional sync — receives client changes, applies LWW merge via atomic BulkWrite, returns missed updates |
| `DELETE` | `/api/attendance` | `attendanceController.resetHistory` | **Danger Zone** — deletes ALL records for `default_user` and saves a `lastResetTimestamp` in `SyncMeta` |

**Sync Request (Client → Server):**
```json
{ "lastSyncTimestamp": 1710000000000, "deviceId": "device_ab12cd", "changes": [{ "date": "2026-03-11", "status": "PRESENT", "updatedAt": 1710185000000, "deviceId": "device_ab12cd" }] }
```

**Sync Response (Server → Client):**
```json
{ "success": true, "serverTimestamp": 1710185005000, "wasReset": false, "updates": [{ "date": "2026-03-10", "status": "ABSENT", "updatedAt": 1710100000000, "deviceId": "phone_xyz" }] }
```

### 3.3 Database Schema (`Attendance`)
```
{
  userId:    String (default: "default_user"),
  date:      String (YYYY-MM-DD, regex-validated),
  status:    String (enum: PRESENT | ABSENT),
  updatedAt: Number (epoch ms — LWW timestamp),
  deviceId:  String (UUID of the editing device)
}
Unique compound index: { userId: 1, date: 1 }
```

### 3.4 Client Data Flow
```
┌─────────────────────────────────────────────────────────┐
│                      Dashboard.jsx                       │
│   (The only page — owns viewDate, selectedDate state)    │
│                                                          │
│   Uses: useAttendance() → returns history, stats,        │
│          markAttendance(), refresh(), edit session fns    │
│                                                          │
│   Uses: useAttendanceStats(history, viewDate) → stats    │
│          for the currently viewed month                   │
└──────────────┬──────────────────────────────┬────────────┘
               │                              │
    ┌──────────▼──────────┐       ┌───────────▼───────────┐
    │   useAttendance()   │       │  useAttendanceStats()  │
    │                     │       │  (Pure calculation)    │
    │  Owns: history {}   │       │  Derives: total,      │
    │  Calls sub-hooks:   │       │  month, streak,       │
    │  • useSyncEngine    │       │  bestStreak, msg      │
    │  • useEditSession   │       └───────────────────────┘
    │  • useAttendanceStats│
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   useSyncEngine()   │
    │                     │
    │  Sync loop:         │
    │  1. Read IDB queue  │
    │  2. POST /sync      │
    │  3. Merge updates   │
    │     (LWW logic)     │
    │  4. Save to IDB     │
    │                     │
    │  Triggers:          │
    │  • Mount (app open) │
    │  • online event     │
    │  • visibilitychange │
    │  • post-edit call   │
    │                     │
    │  Returns: isOffline,│
    │   triggerSync(),    │
    │   refresh()         │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   syncManager.js    │
    │   (IndexedDB via    │
    │    idb-keyval)      │
    │                     │
    │  IDB Keys:          │
    │  • gym-records      │
    │  • gym-sync-queue   │
    │  • gym-last-sync-ts │
    │  • gym-device-id    │
    └─────────────────────┘
```

**How a "Mark Present" click flows (v2.0.0):**
1. User taps "Present" → `markAttendance('PRESENT')` in `useAttendance`
2. A change record is built: `{ date, status, updatedAt: Date.now(), deviceId }`
3. **Optimistic update:** Record is merged into the IDB records store, and the React `history` state is updated immediately
4. The change is pushed to the IDB sync queue
5. `triggerSync()` is called — if online, a `POST /sync` round-trip happens immediately
6. **If online:** Server applies LWW merge (atomic BulkWrite), returns any missed updates. Toast: "Marked as PRESENT!"
7. **If offline:** Queue holds the change. On next online/visibility trigger, the sync loop picks it up

### 3.5 State Management
- **No global state library.** All state lives in React hooks, passed down via props.
- **Theme** is the only Context (`ThemeContext`) — provides `theme` and `toggleTheme()`.
- The `history` object (shape: `{ "YYYY-MM-DD": "PRESENT" | "ABSENT" }`) is the central data structure, owned by `useAttendance`. Internally, `syncManager.js` stores richer records (`{ status, updatedAt, deviceId }`) but converts them to the simple status map for the UI.

### 3.6 Version Management
- The canonical version number lives in `client/package.json` → `version` field (currently `2.1.1`).
- The `Footer` and `SettingsModal` read `pkg.version` to display it.
- The `Dashboard` compares `pkg.version` against `localStorage('appVersion')` to trigger the changelog modal on updates.
- `CHANGELOG.md` tracks high-level version history.
- `data/changelog.js` powers the in-app changelog modal.

---

## 4. Current Development State

### Stable & Working
All features listed in Section 1 are functional in the current codebase. The v2.0.0 CRDT-lite sync engine has been implemented and replaces the previous sync system.

### ✅ Rebuilt: Offline Sync Engine (v2.0.0)
> The offline sync engine was previously rolled back due to instability. It has now been **rebuilt from scratch** using a CRDT-lite (Last-Write-Wins) architecture:
> - Single bi-directional `POST /sync` endpoint replaces old GET/POST routes.
> - Every record carries `updatedAt` (epoch ms) and `deviceId` for conflict resolution.
> - Server uses atomic MongoDB BulkWrite with aggregation pipelines — LWW is enforced at the database level.
> - Client sync manager uses 4 IDB keys: `gym-records`, `gym-sync-queue`, `gym-last-sync-ts`, `gym-device-id`.
> - A 24-hour clock-drift guard prevents future timestamps from corrupting data.
> - **v2.1.0:** Cross-device reset sync (via `SyncMeta` model), retry with exponential backoff (3x at 3s/9s/27s), `NetworkOnly` Workbox strategy for API routes, persistent update banner.
> - **v2.1.1:** Fixed `useSyncEngine` race condition dropping rapid edits in Edit Mode.

### Known Technical Notes
- The PIN for Edit Mode is hardcoded to `0000` (see `PinModal.jsx` line 31).
- `App.css` still contains the default Vite boilerplate styles (logo spin animation, etc.) — it's unused but harmless.
- `server/package.json` version is `1.0.0` and is not kept in sync with the client version. The client version (`2.1.1`) is the authoritative app version.
- There is no user authentication. The app is single-user by design (`userId` defaults to `"default_user"`).
- The `userId` field in the schema is a forward-looking design for future multi-user support.

---

## 5. AI Developer Workflow & Guidelines

> **These rules are mandatory for all AI agents working on this codebase.** The project owner is non-technical and requires clear, jargon-free communication.

### Rule 1: Propose Before Acting
- **Never** create, modify, or delete any file without explicit approval from the project owner.
- Before any change, present a **plain-English, step-by-step implementation plan** that covers:
  - What you're going to change and why.
  - Which files will be created, modified, or deleted.
  - Any risks or trade-offs.
- **Wait for the owner to say "approved" or "go ahead"** before touching any files.

### Rule 2: Autonomous Execution
- Once approved, handle **all** file creation and code updates yourself.
- **Do not** output code blocks for the owner to copy-paste. That is your job.
- Execute the approved plan completely, testing as you go.

### Rule 3: Documentation & Versioning
After every completed update, fix, or feature, you **must** do the following automatically:
1. **Bump the version** in `client/package.json` using semantic versioning:
   - **Patch** (e.g., `1.4.15` → `1.4.16`): Bug fixes, minor tweaks.
   - **Minor** (e.g., `1.4.16` → `1.5.0`): New features.
   - **Major** (e.g., `1.5.0` → `2.0.0`): Breaking changes (rare).
2. **Update `CHANGELOG.md`** with a new version entry describing what changed.
3. **Update `data/changelog.js`** with a user-friendly entry for the in-app modal.
4. **Update `README.md`** if the change affects setup instructions, features list, or other documented behavior.

### Rule 4: Communication Style
- **Avoid jargon.** When explaining *why* something works a certain way, use simple analogies and plain English.
- When presenting a plan, use numbered steps, not walls of text.
- If a concept is inherently technical, briefly explain it in one sentence before using it.

### Rule 5: File & Code Conventions (Observed Patterns)
| Convention | Standard |
|---|---|
| Component files | PascalCase `.jsx` (e.g., `StatsGrid.jsx`) |
| Hook files | camelCase with `use` prefix (e.g., `useAttendance.js`) |
| Utility files | camelCase `.js` (e.g., `dateHelpers.js`) |
| CSS | Tailwind utility classes; dark mode via `dark:` prefix |
| Constants | SCREAMING_SNAKE_CASE in `constants.js` |
| API routes | RESTful, prefixed with `/api/` |
| Comments | Descriptive, often with emoji markers for quick scanning |
| Server code | CommonJS (`require` / `module.exports`) |
| Client code | ES Modules (`import` / `export`) |

### Rule 6: Testing Changes
- After making changes, verify the build succeeds (`npm run build` in `/client`).
- If a feature involves the server, verify the server starts without errors.
- If a feature is UI-related, use the browser tool to visually verify the result.

---

## 6. Quick Reference: Key Files

| Purpose | File |
|---|---|
| App entry point (client) | `client/src/main.jsx` → `App.jsx` → `Dashboard.jsx` |
| Central data hook | `client/src/hooks/useAttendance.js` |
| Offline sync logic | `client/src/hooks/useSyncEngine.js` + `client/src/utils/syncManager.js` |
| Stats calculations | `client/src/utils/dateHelpers.js` + `client/src/hooks/useAttendanceStats.js` |
| API calls | `client/src/services/api.js` |
| Server entry | `server/server.js` |
| Database schema | `server/models/Attendance.js` |
| Sync controller | `server/controllers/syncController.js` |
| Reset controller | `server/controllers/attendanceController.js` |
| Sync metadata | `server/models/SyncMeta.js` |
| App version | `client/package.json` → `version` |
| Changelog (file) | `CHANGELOG.md` |
| Changelog (in-app) | `client/src/data/changelog.js` |
| Theme context | `client/src/context/ThemeContext.jsx` |
| PWA config | `client/vite.config.js` (VitePWA plugin) |
| Tailwind config | `client/tailwind.config.js` |
