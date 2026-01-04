import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { generateCalendarGrid, formatDateString } from '../../utils/dateHelpers';
import { ATTENDANCE_STATUS } from '../../utils/constants'; // <--- Import

const CalendarGrid = ({ data, isEditing, onDateClick }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const days = generateCalendarGrid(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const isTodayCheck = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isPastDate = (day) => {
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
      bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border transition-all duration-300
      ${isEditing ? 'border-red-300 ring-2 ring-red-50 dark:ring-red-900/30 shadow-red-100' : 'border-gray-100 dark:border-slate-800'}
    `}>
      
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-[#C7CBD1] select-none">
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {isEditing && (
        <div className="mb-4 text-center">
          <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            EDIT MODE ACTIVE - Tap any day
          </span>
        </div>
      )}

      <div className="grid grid-cols-7 gap-3 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 dark:text-[#C7CBD1] dark:opacity-60 mb-2">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />; 

          const dateStr = formatDateString(currentYear, currentMonth, day);
          const status = data ? data[dateStr] : null; 
          const isToday = isTodayCheck(day);
          const isPast = isPastDate(day);

          let finalClasses = "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm ";
          
          if (isEditing || isToday) {
            finalClasses += "cursor-pointer active:scale-90 hover:opacity-80 ";
          } else {
            finalClasses += "cursor-default ";
          }

          // UPDATED: Use Constants for Styling Logic
          if (status === ATTENDANCE_STATUS.PRESENT) {
            finalClasses += "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none ";
          } else if (status === ATTENDANCE_STATUS.ABSENT) {
            finalClasses += "bg-rose-500 text-white shadow-rose-200 dark:shadow-none ";
          } else {
             if (isPast) {
               finalClasses += "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-[#C7CBD1] dark:opacity-40 ";
             } else {
               finalClasses += "bg-gray-50 dark:bg-slate-800/50 text-gray-300 dark:text-[#C7CBD1] dark:opacity-80 ";
             }
          }

          if (isToday) {
             finalClasses += "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 z-10 font-extrabold ";
             if (!status) finalClasses += "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 ";
          }

          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={finalClasses}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;