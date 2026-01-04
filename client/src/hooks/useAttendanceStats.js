import { useMemo } from 'react';
import { calculateStats, calculateStreak, calculateBestStreak } from '../utils/dateHelpers';

export const useAttendanceStats = (history) => {
  return useMemo(() => {
    const { total, month } = calculateStats(history);
    const currentStreak = calculateStreak(history);
    const bestStreak = calculateBestStreak(history);

    let streakMsg = "Start it up! ❄️";
    if (currentStreak >= 3) streakMsg = "Heating up! 🔥";
    if (currentStreak >= 7) streakMsg = "On Fire! 🚀";
    if (currentStreak >= 14) streakMsg = "Unstoppable! 🏆";
    if (currentStreak >= 30) streakMsg = "God Mode! ⚡";

    return { total, month, streak: currentStreak, bestStreak, streakMsg };
  }, [history]);
};