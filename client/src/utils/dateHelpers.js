import { ATTENDANCE_STATUS } from './constants';

export const generateCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); 
  
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

export const formatDateString = (year, month, day) => {
  const y = year;
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// UPDATED: Now accepts 'viewDate' to calculate stats for ANY month
export const calculateStats = (history, viewDate = new Date()) => {
  const historyValues = Object.values(history);
  const totalPresent = historyValues.filter(s => s === ATTENDANCE_STATUS.PRESENT).length;
  const totalDays = historyValues.length;
  
  // --- MONTHLY LOGIC UPDATED ---
  const targetMonth = viewDate.getMonth();
  const targetYear = viewDate.getFullYear();

  // Filter history keys (dates) that match the Target Month & Year
  const monthEntries = Object.keys(history).filter(dateStr => {
    const [y, m] = dateStr.split('-').map(Number);
    // Note: 'm' in date string is 1-12, getMonth() is 0-11. So we check (m - 1).
    return y === targetYear && (m - 1) === targetMonth;
  });

  const monthPresent = monthEntries.filter(
    date => history[date] === ATTENDANCE_STATUS.PRESENT
  ).length;

  const monthAbsent = monthEntries.filter(
    date => history[date] === ATTENDANCE_STATUS.ABSENT
  ).length;

  // Calculate Consistency (Percentage)
  const totalPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
  
  const monthLogged = monthPresent + monthAbsent;
  const monthPercentage = monthLogged > 0 ? Math.round((monthPresent / monthLogged) * 100) : 0;

  return {
    total: { present: totalPresent, percentage: totalPercentage },
    month: { present: monthPresent, absent: monthAbsent, percentage: monthPercentage }
  };
};

export const calculateStreak = (history) => {
  const today = new Date();
  const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Helper to subtract days
  const getPrevDate = (date) => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    return prev;
  };

  let currentStreak = 0;
  let checkDate = new Date();

  // If today is marked PRESENT, start counting from today
  // If not, check yesterday (streak isn't broken until you miss a day entirely)
  if (history[todayStr] === ATTENDANCE_STATUS.PRESENT) {
    currentStreak++;
    checkDate = getPrevDate(checkDate);
  } else {
    // Check if yesterday was present
    const yesterday = getPrevDate(checkDate);
    const yesterdayStr = formatDateString(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    if (history[yesterdayStr] !== ATTENDANCE_STATUS.PRESENT) {
      return 0; // Streak broken
    }
    checkDate = yesterday;
  }

  // Loop backwards
  while (true) {
    const dateStr = formatDateString(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    if (history[dateStr] === ATTENDANCE_STATUS.PRESENT) {
      currentStreak++;
      checkDate = getPrevDate(checkDate);
    } else {
      break;
    }
  }

  return currentStreak;
};

export const calculateBestStreak = (history) => {
  const dates = Object.keys(history)
    .filter(d => history[d] === ATTENDANCE_STATUS.PRESENT)
    .sort();

  if (dates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1]);
    const curr = new Date(dates[i]);
    
    // Difference in time
    const diffTime = Math.abs(curr - prev);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) maxStreak = currentStreak;
  }

  return maxStreak;
};

// NEW: Advanced Analytics for Excel Reporting (v2.2.1)
export const calculateAdvancedStats = (history) => {
  const dates = Object.keys(history).sort();
  if (dates.length === 0) return null;

  // 1. Day of Week Distribution
  const dayStats = {
    0: { present: 0, absent: 0, name: 'Sunday' },
    1: { present: 0, absent: 0, name: 'Monday' },
    2: { present: 0, absent: 0, name: 'Tuesday' },
    3: { present: 0, absent: 0, name: 'Wednesday' },
    4: { present: 0, absent: 0, name: 'Thursday' },
    5: { present: 0, absent: 0, name: 'Friday' },
    6: { present: 0, absent: 0, name: 'Saturday' },
  };

  // 2. Longest Rest
  let longestRest = 0;
  let currentRest = 0;

  // 3. Monthly Trends
  const monthlyTrends = {}; // Format: 'YYYY-MM': { present, absent, name }

  dates.forEach(dateStr => {
    const status = history[dateStr];
    // Create Date safely by parsing local parts
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    
    // Day of Week tracking
    const dayOfWeek = dateObj.getDay();
    if (status === ATTENDANCE_STATUS.PRESENT) {
      dayStats[dayOfWeek].present++;
    } else {
      dayStats[dayOfWeek].absent++;
    }

    // Longest Rest Tracking (Consecutive ABSENT)
    if (status === ATTENDANCE_STATUS.ABSENT) {
      currentRest++;
      if (currentRest > longestRest) longestRest = currentRest;
    } else {
      currentRest = 0;
    }

    // Monthly Trends Grouping
    const monthKey = `${y}-${m}`;
    const monthName = dateObj.toLocaleString('default', { month: 'short' });
    const fullKey = `${monthName} ${y}`;

    if (!monthlyTrends[monthKey]) {
      monthlyTrends[monthKey] = { label: fullKey, present: 0, absent: 0 };
    }

    if (status === ATTENDANCE_STATUS.PRESENT) {
      monthlyTrends[monthKey].present++;
    } else {
      monthlyTrends[monthKey].absent++;
    }
  });

  // Calculate Most/Least Active Days
  let mostActiveDay = { name: 'N/A', percentage: 0 };
  let leastActiveDay = { name: 'N/A', percentage: 100 };
  let hasValidDayData = false;

  Object.values(dayStats).forEach(day => {
    const total = day.present + day.absent;
    if (total > 0) {
      hasValidDayData = true;
      const percentage = Math.round((day.present / total) * 100);
      
      if (percentage >= mostActiveDay.percentage) {
         mostActiveDay = { name: day.name, percentage };
      }
      if (percentage <= leastActiveDay.percentage) {
         leastActiveDay = { name: day.name, percentage };
      }
    }
  });

  if (!hasValidDayData) {
    leastActiveDay = { name: 'N/A', percentage: 0 };
  }

  // Calculate Most Consistent Month
  let mostConsistentMonth = { label: 'N/A', percentage: 0 };
  
  // Sort Monthly Array chronologically (keys are YYYY-MM)
  const sortedMonthKeys = Object.keys(monthlyTrends).sort();
  const monthlyArray = sortedMonthKeys.map(key => {
     const m = monthlyTrends[key];
     const total = m.present + m.absent;
     const percentage = total > 0 ? Math.round((m.present / total) * 100) : 0;
     
     if (percentage >= mostConsistentMonth.percentage && total > 0) {
        mostConsistentMonth = { label: m.label, percentage };
     }
     
     return {
       label: m.label,
       present: m.present,
       absent: m.absent,
       total,
       percentage
     };
  });

  return {
    dayStats,
    mostActiveDay,
    leastActiveDay,
    longestRest,
    monthlyTrends: monthlyArray,
    mostConsistentMonth
  };
};