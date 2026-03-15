# Changelog

All notable changes to the "GymTrack" project will be documented in this file.

## [v2.2.0] - 2026-03-15
### Added
- **Export Filters & Freezing:** Added `AutoFilter` dropdowns and frozen top headers to the Daily Log sheet in exported Excel files.
- **Timestamped Filenames:** Exported Excel files now include precise IST (Indian Standard Time) timestamps in their filenames to prevent overwriting multiple daily exports.

### Changed
- **Export Dashboard Overhaul:** Completely redesigned the 'Dashboard' sheet in the exported Excel file with modern typography, improved spacing, and professional color contrast.

### Fixed
- **Stale Export Bug & Background Loop:** Fixed a critical bug where the Settings Modal was maintaining a disconnected, duplicate sync engine state. Exporting history now fetches fresh data instantly from the local database ensuring 100% data accuracy without a page reload.

## [v2.1.2] - 2026-03-15
### Fixed
- **Hard Database Wipe Sync:** Handled an edge case where manually deleting all records directly from the database (bypassing the app UI) prevented clients from resetting. The server now cross-references the client's historical sync timestamp against the total server record count to deduce manual wipes.

## [v2.1.1] - 2026-03-15
### Fixed
- **Edit Mode Sync Drop:** Fixed a race condition in `useSyncEngine` where rapid sequential edits (e.g., tapping 3 past days quickly in Edit Mode) were dropped by the local sync queue. The engine now detects overlapping sync requests and schedules an automatic follow-up sync to completely drain the queue.

## [v2.1.0] - 2026-03-15
### Added
- **Cross-Device Reset Sync:** New `SyncMeta` model tracks when history was reset. Other devices now detect the reset during sync and automatically wipe stale local data.
- **Sync Retry:** Failed syncs now retry up to 3 times with exponential backoff (3s → 9s → 27s). Only retries on server/network errors, not client errors.
- **API Cache Guard:** Added `NetworkOnly` Workbox runtime caching strategy for `/api/*` routes, preventing the service worker from ever caching sync responses.

### Fixed
- **Update Banner Persistence:** Dismissing the "New version available" banner no longer hides it permanently. It reappears when the user returns to the app (tab focus / reopen).
- **Interval Leak:** The hourly service worker update check is now properly cleaned up via `useEffect`.

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