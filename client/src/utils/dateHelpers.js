export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const generateCalendarGrid = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const grid = [];
  
  // Fill initial empty slots
  for (let i = 0; i < startDay; i++) {
    grid.push(null);
  }
  
  // Fill days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(i);
  }
  
  return grid;
};

export const formatDateString = (year, month, day) => {
  // Ensure we use 0-padded months (01, 02) and days (01, 05)
  // Note: Month is 0-indexed (Jan=0), so we add 1.
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

/**
 * Calculates the current attendance streak.
 * Logic:
 * 1. Counts consecutive 'PRESENT' days backwards from Today.
 * 2. If Today is empty (not marked yet), it doesn't break the streak; it checks Yesterday.
 * 3. If Yesterday is missing/absent, streak is 0.
 */
export const calculateStreak = (history) => {
  // Get all dates marked as 'PRESENT'
  const presentDates = new Set(
    Object.keys(history).filter(date => history[date] === 'PRESENT')
  );

  let streak = 0;
  let d = new Date(); // Start checking from Today

  // Loop backwards endlessly until we find a gap
  while (true) {
    const dStr = formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
    const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    if (presentDates.has(dStr)) {
      // If found, increment streak
      streak++;
    } else {
      // If MISSING...
      // Special Rule: If it's TODAY and we haven't marked it yet, 
      // don't break the streak. Just ignore it and check yesterday.
      if (dStr === todayStr) {
        // Do nothing, just continue to yesterday
      } else {
        // If it's yesterday or earlier and missing, Streak is OVER.
        break;
      }
    }
    
    // Go back one day
    d.setDate(d.getDate() - 1);
  }

  return streak;
};