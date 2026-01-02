import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// UPDATED: Added 'disabled' prop to block clicks during Edit Mode
const ActionButtons = ({ onMark, loading, currentStatus, disabled }) => {
  
  // Helper to determine opacity/pointer-events
  const containerClass = disabled 
    ? "opacity-40 pointer-events-none grayscale" // Dimmed when disabled
    : "opacity-100";

  return (
    <div className={`grid grid-cols-2 gap-4 mb-6 transition-all duration-300 ${containerClass}`}>
      
      {/* PRESENT BUTTON */}
      <button
        onClick={() => onMark('PRESENT')}
        disabled={loading || disabled}
        className={`
          relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
          ${currentStatus === 'PRESENT' 
            ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-xl scale-[1.02] ring-0' 
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
        disabled={loading || disabled}
        className={`
          relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
          ${currentStatus === 'ABSENT' 
            ? 'bg-rose-500 text-white shadow-rose-200 shadow-xl scale-[1.02] ring-0' 
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