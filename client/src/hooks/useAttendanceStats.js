import { useMemo } from 'react';
import { calculateStats, calculateStreak, calculateBestStreak } from '../utils/dateHelpers';

// UPDATED: Now accepts 'viewDate' to calculate specific monthly stats
export const useAttendanceStats = (history, viewDate = new Date()) => {
  return useMemo(() => {
    // Pass viewDate to helper to filter by selected month
    const { total, month } = calculateStats(history, viewDate);
    const currentStreak = calculateStreak(history);
    const bestStreak = calculateBestStreak(history);

    let streakMsg = "Start it up! ❄️";
    if (currentStreak >= 3) streakMsg = "Heating up! 🔥";
    if (currentStreak >= 7) streakMsg = "On Fire! 🚀";
    if (currentStreak >= 14) streakMsg = "Unstoppable! 🏆";
    if (currentStreak >= 30) streakMsg = "God Mode! ⚡";

    return { total, month, streak: currentStreak, bestStreak, streakMsg };
  }, [history, viewDate]); // Re-calculate when month changes
};