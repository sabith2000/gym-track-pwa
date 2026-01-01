// client/src/utils/dateHelpers.js

// Get total days in a specific month/year
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Get which weekday the month starts on (0 = Sunday, 1 = Monday...)
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Generate an array of days for the grid
// Example: [null, null, 1, 2, 3, ..., 31]
export const generateCalendarGrid = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const grid = [];

  // Add empty slots for days before the 1st
  for (let i = 0; i < startDay; i++) {
    grid.push(null);
  }

  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(i);
  }

  return grid;
};

// Format date to YYYY-MM-DD (matches our Database)
export const formatDateString = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};