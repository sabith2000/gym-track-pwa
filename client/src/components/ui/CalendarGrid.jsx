import React from 'react';
import { generateCalendarGrid, formatDateString } from '../../utils/dateHelpers';

// UPDATED: Now accepts 'data' prop (Real history from database)
const CalendarGrid = ({ data }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); 
  const currentDay = today.getDate();

  const isPastDate = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const now = new Date();
    now.setHours(0,0,0,0);
    checkDate.setHours(0,0,0,0);
    return checkDate < now;
  };

  const days = generateCalendarGrid(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-extrabold text-gray-800">
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 mb-2">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />; 

          const dateStr = formatDateString(currentYear, currentMonth, day);
          
          // UPDATED: Use the real data passed from App.jsx
          const status = data ? data[dateStr] : null; 
          
          const isToday = day === currentDay;
          const isPast = isPastDate(day);

          // --- VISUAL LOGIC ---
          let baseClasses = "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm";
          let colorClasses = "";

          if (status === 'PRESENT') {
            colorClasses = "bg-emerald-500 text-white shadow-emerald-200 shadow-md transform hover:scale-105";
          } else if (status === 'ABSENT') {
            colorClasses = "bg-rose-500 text-white shadow-rose-200 shadow-md opacity-90";
          } else {
             if (isToday) {
               colorClasses = "bg-white text-blue-600";
             } else if (isPast) {
               colorClasses = "bg-gray-200 text-gray-400 border border-gray-300";
             } else {
               colorClasses = "bg-gray-50 text-gray-300";
             }
          }

          const borderClasses = isToday 
            ? "ring-2 ring-blue-600 ring-offset-2 z-10" 
            : "border-transparent";

          return (
            <button
              key={day}
              className={`${baseClasses} ${colorClasses} ${borderClasses}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;