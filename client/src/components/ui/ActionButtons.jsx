import React from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { ATTENDANCE_STATUS } from '../../utils/constants';

const ActionButtons = ({ onMark, onCancel, loading, currentStatus, disabled }) => {
  
  const containerClass = disabled 
    ? "opacity-40 pointer-events-none grayscale"
    : "opacity-100";

  // Logic: You can't click Present if you are already Present
  const isPresentDisabled = loading || disabled || currentStatus === ATTENDANCE_STATUS.PRESENT;
  const isAbsentDisabled = loading || disabled || currentStatus === ATTENDANCE_STATUS.ABSENT;

  return (
    <div className={`transition-all duration-300 ${containerClass}`}>
      <div className="grid grid-cols-2 gap-4">
        
        {/* PRESENT BUTTON */}
        <button
          onClick={() => onMark(ATTENDANCE_STATUS.PRESENT)}
          disabled={isPresentDisabled}
          className={`
            relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
            ${currentStatus === ATTENDANCE_STATUS.PRESENT 
              ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-300 ring-2 ring-emerald-500/20 cursor-not-allowed opacity-60' // Disabled Look
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm active:scale-95'
            }
          `}
        >
          <CheckCircleIcon className={`w-12 h-12 mb-2 transition-colors ${
            currentStatus === ATTENDANCE_STATUS.PRESENT ? 'text-emerald-300' : 'text-emerald-500'
          }`} />
          <span className="font-bold text-lg">Present</span>
        </button>

        {/* ABSENT BUTTON */}
        <button
          onClick={() => onMark(ATTENDANCE_STATUS.ABSENT)}
          disabled={isAbsentDisabled}
          className={`
            relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
            ${currentStatus === ATTENDANCE_STATUS.ABSENT 
              ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-300 ring-2 ring-rose-500/20 cursor-not-allowed opacity-60' // Disabled Look
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 shadow-sm active:scale-95'
            }
          `}
        >
          <XCircleIcon className={`w-12 h-12 mb-2 transition-colors ${
            currentStatus === ATTENDANCE_STATUS.ABSENT ? 'text-rose-300' : 'text-rose-500'
          }`} />
          <span className="font-bold text-lg">Absent</span>
        </button>

      </div>

      {/* CANCEL BUTTON (Only shows during Edit/Retry) */}
      {onCancel && (
        <button 
          onClick={onCancel}
          className="w-full mt-3 py-2 flex items-center justify-center space-x-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
          <span>Cancel Edit</span>
        </button>
      )}
    </div>
  );
};

export default ActionButtons;