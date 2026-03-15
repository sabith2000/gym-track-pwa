# Changelog

All notable changes to the "GymTrack" project will be documented in this file.

## [v2.0.0] - 2026-03-15
### Added
- **CRDT-Lite Sync Engine:** Rebuilt the offline sync system from scratch using a Last-Write-Wins (LWW) strategy with `updatedAt` timestamps and `deviceId` fingerprinting.
- **Bi-Directional Sync:** Single `POST /api/attendance/sync` endpoint replaces old GET/POST routes. Client sends pending changes and receives missed updates in one round-trip.
- **Atomic Server Merges:** MongoDB BulkWrite with aggregation pipelines ensures conflict resolution happens at the database level, not in application code.
- **Clock-Drift Guard:** Server rejects any timestamp more than 24 hours in the future to prevent faulty device clocks from corrupting data.

### Changed
- **Data Model:** Attendance records now include `userId`, `updatedAt` (epoch ms), and `deviceId`. Old `history` audit trail array removed.
- **Sync Manager:** Rewrote `syncManager.js` with richer IndexedDB storage — records map, sync queue, timestamp cursor, and device UUID.
- **Hooks:** Rewrote `useSyncEngine.js` (bi-directional sync loop) and `useAttendance.js` (LWW-aware edits).
- **Settings Reset:** Now clears local IndexedDB data alongside the server reset for a true factory reset.

### Removed
- Old `GET /api/attendance` and `POST /api/attendance` endpoints (replaced by sync endpoint).
- 2-minute heartbeat polling interval (replaced by visibility-change trigger).

## [v1.3.1] - 2026-01-04
### Refactor
- **Hooks:** Extracted edit session logic (timer, locking) from `useAttendance` into a new `useEditSession` hook.
- **Maintenance:** Reduced `useAttendance.js` complexity by ~50 lines to improve readability and maintainability.

## [v1.2.0] - 2026-01-04
### Added
- **Dark Mode:** Full dark theme support with a system-aware toggle in Settings.
- **Settings Menu:** New slide-up drawer for app preferences (Dark Mode, Version Info).
- **Refactor:** Split `App.jsx` into `Dashboard` (Logic) and `StatsGrid` (UI) for better performance and maintainability.
- **Visuals:** Updated Stat Cards to support dark mode with high-contrast text (`#C7CBD1`) and subtle borders.
- **Components:** Updated Status Banner, Edit Modal, and Pin Modal to be fully responsive to dark theme.
- **Config:** Updated Tailwind config to support `darkMode: 'class'` and custom animations.

### Changed
- **Footer:** Updated Creator signature to Fluorescent Yellow (`#ccff00`) and refined version pill styling.
- **Text:** Standardized text colors across the app for better readability on both light and dark backgrounds.


## [v1.1.0] - 2026-01-02
### Added
- **Streak Analytics:** Added "Current Streak" and "Best Streak" calculation logic.
- **Advanced Stats:** Added "Month vs Lifetime" split view for attendance rates.
- **Activity Log:** Added detailed breakdown of Present/Absent counts.
- **Edit Mode:** Added PIN-protected (0000) mode to edit past dates.
- **Status Banner:** Added dynamic banner for edit timer and system announcements.
- **Mobile Optimization:** Added `inputMode="numeric"` to PIN modal for better mobile keyboard experience.

### Changed
- **UI Makeover:** Updated Stat Cards to support badges and split views.
- **Header:** Cleaned up layout, moved timer to Status Banner.
- **Identity:** Updated browser/tab title and icon to GymTrack branding.

## [v1.0.0] - 2026-01-01
### Added
- Initial Release of GymTrack PWA.
- Core Feature: Mark Present/Absent for Today.
- Core Feature: Offline Support (Sync Queue).
- Core Feature: Calendar View (Read-Only).
- Basic Stats: Total Sessions and Percentage.