import React from 'react';
import { InformationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const StatusBanner = ({ isEditing, timer, customMessage }) => {
  
  // 1. EDIT MODE (Active Timer)
  if (isEditing) {
    return (
      <div className="mb-6 animate-fade-in">
        {/* UPDATED: dark:bg-red-900/20, dark:border-red-900/50, dark:text-red-200 */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full animate-pulse">
              <ClockIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-200">Edit Mode Unlocked</p>
              <p className="text-xs text-red-600 dark:text-red-300/80 font-medium">
                Tap days to modify history
              </p>
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-red-600 dark:text-red-400 w-12 text-center">
            {timer}s
          </div>
        </div>
      </div>
    );
  }

  // 2. CUSTOM ANNOUNCEMENT (Optional)
  if (customMessage) {
    return (
      <div className="mb-6 animate-fade-in">
        {/* UPDATED: dark:bg-slate-800, dark:border-slate-700 */}
        <div className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
          {/* UPDATED: dark:text-slate-300 */}
          <p className="text-sm text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
            {customMessage}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default StatusBanner;