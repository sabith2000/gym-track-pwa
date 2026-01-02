import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const ActionButtons = ({ onMark, loading, currentStatus }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      
      {/* PRESENT BUTTON */}
      <button
        onClick={() => onMark('PRESENT')}
        disabled={loading}
        className={`
          relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
          ${currentStatus === 'PRESENT' 
            // ACTIVE STATE: Solid Vibrant Green, White Text, Deep Shadow
            ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-xl scale-[1.02] ring-0' 
            // INACTIVE STATE: White BG, Green Border, Green Icon
            : 'bg-white text-gray-700 border-2 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md'
          }
        `}
      >
        <CheckCircleIcon className={`w-12 h-12 mb-2 transition-colors ${
          currentStatus === 'PRESENT' ? 'text-white' : 'text-emerald-500'
        }`} />
        <span className="font-bold text-lg">Present</span>
      </button>

      {/* ABSENT BUTTON */}
      <button
        onClick={() => onMark('ABSENT')}
        disabled={loading}
        className={`
          relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
          ${currentStatus === 'ABSENT' 
            // ACTIVE STATE: Solid Vibrant Red, White Text, Deep Shadow
            ? 'bg-rose-500 text-white shadow-rose-200 shadow-xl scale-[1.02] ring-0' 
            // INACTIVE STATE: White BG, Red Border, Red Icon
            : 'bg-white text-gray-700 border-2 border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md'
          }
        `}
      >
        <XCircleIcon className={`w-12 h-12 mb-2 transition-colors ${
          currentStatus === 'ABSENT' ? 'text-white' : 'text-rose-500'
        }`} />
        <span className="font-bold text-lg">Absent</span>
      </button>

    </div>
  );
};

export default ActionButtons;