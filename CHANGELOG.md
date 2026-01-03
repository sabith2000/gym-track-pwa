# Changelog

All notable changes to the "GymTrack" project will be documented in this file.

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