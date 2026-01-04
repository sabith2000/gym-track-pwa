import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { generateCalendarGrid, formatDateString } from '../../utils/dateHelpers';
import { ATTENDANCE_STATUS } from '../../utils/constants';

const CalendarGrid = ({ data, isEditing, onDateClick }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // 1. OPTIMIZATION: Memoize calculation to prevent lag on re-renders
  const days = useMemo(() => 
    generateCalendarGrid(currentYear, currentMonth), 
  [currentYear, currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  // Helper to ensure stable Today check
  const isTodayCheck = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isPastDate = (day) => {
    if (!day) return false;
    const checkDate = new Date(currentYear, currentMonth, day);
    const now = new Date();
    now.setHours(0,0,0,0);
    checkDate.setHours(0,0,0,0);
    return checkDate < now;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const isToday = isTodayCheck(day);
    if (isEditing || isToday) {
       const dateStr = formatDateString(currentYear, currentMonth, day);
       onDateClick(dateStr); 
    }
  };

  return (
    <div className={`
      relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border transition-all duration-300
      ${isEditing ? 'border-red-300 ring-2 ring-red-50 dark:ring-red-900/30 shadow-red-100' : 'border-gray-100 dark:border-slate-800'}
    `}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={prevMonth} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 active:scale-90 transition-transform"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        {/* Animated Title */}
        <h3 
          key={`${currentYear}-${currentMonth}`} 
          className="text-xl font-extrabold text-gray-900 dark:text-[#C7CBD1] select-none animate-[fade-in_0.2s_ease-out]"
        >
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button 
          onClick={nextMonth} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 active:scale-90 transition-transform"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {isEditing && (
        <div className="mb-4 text-center animate-[fade-in_0.3s_ease-out]">
          <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse shadow-sm">
            EDIT MODE ACTIVE • Tap any day
          </span>
        </div>
      )}

      {/* WEEKDAY HEADER */}
      <div className="grid grid-cols-7 gap-3 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 dark:text-[#C7CBD1] dark:opacity-50 uppercase tracking-wider">
            {day}
          </div>
        ))}

        {/* 2. THE MAGIC FIX: "key" prop forces React to replace the grid instantly. 
            No more morphing/flickering numbers. 
        */}
        <div key={`${currentYear}-${currentMonth}`} className="contents animate-[fade-in_0.2s_ease-out]">
          {days.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />; 

            const dateStr = formatDateString(currentYear, currentMonth, day);
            const status = data ? data[dateStr] : null; 
            const isToday = isTodayCheck(day);
            const isPast = isPastDate(day);

            let finalClasses = "aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm relative ";
            
            if (isEditing || isToday) {
              finalClasses += "cursor-pointer active:scale-90 hover:brightness-95 ";
            } else {
              finalClasses += "cursor-default ";
            }

            // --- COLOR LOGIC ---
            if (status === ATTENDANCE_STATUS.PRESENT) {
              finalClasses += "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none ";
            } else if (status === ATTENDANCE_STATUS.ABSENT) {
              finalClasses += "bg-rose-500 text-white shadow-rose-200 dark:shadow-none ";
            } else {
               if (isPast) {
                 finalClasses += "bg-gray-100 dark:bg-slate-800/80 text-gray-400 dark:text-[#C7CBD1] dark:opacity-40 ";
               } else {
                 finalClasses += "bg-gray-50 dark:bg-slate-800/30 text-gray-300 dark:text-[#C7CBD1] dark:opacity-80 ";
               }
            }

            if (isToday) {
               // More fluid "Today" ring
               finalClasses += "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-900 z-10 font-extrabold ";
               if (!status) finalClasses += "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 ";
            }

            return (
              <div 
                key={`${currentYear}-${currentMonth}-${day}`} 
                onClick={() => handleDayClick(day)}
                className={finalClasses}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;