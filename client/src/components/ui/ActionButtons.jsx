import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ATTENDANCE_STATUS } from '../../utils/constants'; // <--- Import

const ActionButtons = ({ onMark, loading, currentStatus, disabled }) => {
  
  const containerClass = disabled 
    ? "opacity-40 pointer-events-none grayscale"
    : "opacity-100";

  return (
    <div className={`grid grid-cols-2 gap-4 mb-6 transition-all duration-300 ${containerClass}`}>
      
      {/* PRESENT BUTTON */}
      <button
        onClick={() => onMark(ATTENDANCE_STATUS.PRESENT)} // <--- Use Constant
        disabled={loading || disabled}
        className={`
          relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
          ${currentStatus === ATTENDANCE_STATUS.PRESENT 
            ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none shadow-xl scale-[1.02] ring-0' 
            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm'
          }
        `}
      >
        <CheckCircleIcon className={`w-12 h-12 mb-2 transition-colors ${
          currentStatus === ATTENDANCE_STATUS.PRESENT ? 'text-white' : 'text-emerald-500'
        }`} />
        <span className="font-bold text-lg">Present</span>
      </button>

      {/* ABSENT BUTTON */}
      <button
        onClick={() => onMark(ATTENDANCE_STATUS.ABSENT)} // <--- Use Constant
        disabled={loading || disabled}
        className={`
          relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
          ${currentStatus === ATTENDANCE_STATUS.ABSENT 
            ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-none shadow-xl scale-[1.02] ring-0' 
            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 shadow-sm'
          }
        `}
      >
        <XCircleIcon className={`w-12 h-12 mb-2 transition-colors ${
          currentStatus === ATTENDANCE_STATUS.ABSENT ? 'text-white' : 'text-rose-500'
        }`} />
        <span className="font-bold text-lg">Absent</span>
      </button>

    </div>
  );
};

export default ActionButtons;