import React from 'react';
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ATTENDANCE_STATUS } from '../../utils/constants';

const TodayStatusCard = ({ status, onEdit }) => {
  const isPresent = status === ATTENDANCE_STATUS.PRESENT;

  return (
    <div className={`
      relative overflow-hidden w-full p-6 rounded-2xl shadow-lg transition-all duration-300
      ${isPresent 
        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200 dark:shadow-none' 
        : 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200 dark:shadow-none'
      }
    `}>
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 opacity-20 rotate-12">
        {isPresent 
          ? <CheckCircleIcon className="w-32 h-32" /> 
          : <XCircleIcon className="w-32 h-32" />
        }
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {isPresent ? 'Marked Present' : 'Marked Absent'}
          </h2>
          <p className="text-white/80 font-medium text-sm">
            {isPresent ? 'Great job! Keep it up. 💪' : 'Rest days are important too. 💤'}
          </p>
        </div>

        <button 
          onClick={onEdit}
          className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white px-4 py-2 rounded-xl backdrop-blur-sm font-bold text-sm"
        >
          <PencilSquareIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};

export default TodayStatusCard;