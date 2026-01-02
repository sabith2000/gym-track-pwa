import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { generateCalendarGrid, formatDateString } from '../../utils/dateHelpers';

const CalendarGrid = ({ data, isEditing, onDateClick }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const days = generateCalendarGrid(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigation
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
    // Only allow click if day exists AND (it's today OR we are in edit mode)
    if (!day) return;
    
    const isPast = isPastDate(day);
    const isToday = isTodayCheck(day);

    if (isEditing || isToday) {
       const dateStr = formatDateString(currentYear, currentMonth, day);
       // Pass the click back to Parent
       onDateClick(dateStr); 
    }
  };

  return (
    <div className={`
      bg-white rounded-3xl p-6 shadow-md border transition-all duration-300
      ${isEditing ? 'border-red-300 ring-2 ring-red-50 shadow-red-100' : 'border-gray-100'}
    `}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-extrabold text-gray-900 select-none">
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Helper Text for Edit Mode */}
      {isEditing && (
        <div className="mb-4 text-center">
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            EDIT MODE ACTIVE - Tap any day
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-7 gap-3 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 mb-2">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />; 

          const dateStr = formatDateString(currentYear, currentMonth, day);
          const status = data ? data[dateStr] : null; 
          const isToday = isTodayCheck(day);
          const isPast = isPastDate(day);

          // 1. Base Shape
          let finalClasses = "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm ";
          
          // 2. Interactive Cursor?
          if (isEditing || isToday) {
            finalClasses += "cursor-pointer active:scale-90 hover:opacity-80 ";
          } else {
            finalClasses += "cursor-default ";
          }

          // 3. Status Colors
          if (status === 'PRESENT') {
            finalClasses += "bg-emerald-500 text-white shadow-emerald-200 ";
          } else if (status === 'ABSENT') {
            finalClasses += "bg-rose-500 text-white shadow-rose-200 ";
          } else {
             if (isPast) {
               finalClasses += "bg-gray-100 text-gray-400 ";
             } else {
               finalClasses += "bg-gray-50 text-gray-300 ";
             }
          }

          if (isToday) {
             finalClasses += "ring-2 ring-blue-600 ring-offset-2 z-10 font-extrabold ";
             if (!status) finalClasses += "text-blue-600 bg-white ";
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