export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

export const generateCalendarGrid = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const grid = [];
  for (let i = 0; i < startDay; i++) grid.push(null);
  for (let i = 1; i <= daysInMonth; i++) grid.push(i);
  return grid;
};

export const formatDateString = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// --- STREAK LOGIC ---

export const calculateStreak = (history) => {
  const presentDates = new Set(Object.keys(history).filter(date => history[date] === 'PRESENT'));
  let streak = 0;
  let d = new Date(); 

  while (true) {
    const dStr = formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
    const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    if (presentDates.has(dStr)) {
      streak++;
    } else {
      // If Today is missing, don't break streak yet. If Yesterday missing, break.
      if (dStr !== todayStr) break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

export const calculateBestStreak = (history) => {
  // Get all 'PRESENT' dates and sort them
  const sortedDates = Object.keys(history)
    .filter(date => history[date] === 'PRESENT')
    .sort();

  if (sortedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i-1]);
    const curr = new Date(sortedDates[i]);
    
    // Check if dates are exactly 1 day apart
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

// --- AGGREGATE STATS (Monthly vs Total) ---
export const calculateStats = (history) => {
  const today = new Date();
  const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  let totalPresent = 0;
  let totalAbsent = 0;
  let monthPresent = 0;
  let monthAbsent = 0;

  Object.entries(history).forEach(([date, status]) => {
    // Total Counts
    if (status === 'PRESENT') totalPresent++;
    if (status === 'ABSENT') totalAbsent++;

    // Monthly Counts
    if (date.startsWith(currentMonthPrefix)) {
      if (status === 'PRESENT') monthPresent++;
      if (status === 'ABSENT') monthAbsent++;
    }
  });

  const totalEntries = totalPresent + totalAbsent;
  const monthEntries = monthPresent + monthAbsent;

  return {
    total: {
      present: totalPresent,
      absent: totalAbsent,
      percentage: totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0
    },
    month: {
      present: monthPresent,
      absent: monthAbsent,
      percentage: monthEntries > 0 ? Math.round((monthPresent / monthEntries) * 100) : 0
    }
  };
};