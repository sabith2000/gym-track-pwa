import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const ActionButtons = ({ onMark, loading, currentStatus }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      
      {/* PRESENT BUTTON */}
      <button
        onClick={() => onMark('PRESENT')}
        disabled={loading || currentStatus === 'PRESENT'}
        className={`
          flex flex-col items-center justify-center p-6 rounded-2xl transition-all
          ${currentStatus === 'PRESENT' 
            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' 
            : 'bg-white text-gray-600 shadow-sm hover:shadow-md hover:bg-emerald-50 active:scale-95'}
        `}
      >
        <CheckCircleIcon className={`w-12 h-12 mb-2 ${currentStatus === 'PRESENT' ? 'text-emerald-600' : 'text-emerald-400'}`} />
        <span className="font-bold text-lg">Present</span>
      </button>

      {/* ABSENT BUTTON */}
      <button
        onClick={() => onMark('ABSENT')}
        disabled={loading || currentStatus === 'ABSENT'}
        className={`
          flex flex-col items-center justify-center p-6 rounded-2xl transition-all
          ${currentStatus === 'ABSENT' 
            ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500' 
            : 'bg-white text-gray-600 shadow-sm hover:shadow-md hover:bg-rose-50 active:scale-95'}
        `}
      >
        <XCircleIcon className={`w-12 h-12 mb-2 ${currentStatus === 'ABSENT' ? 'text-rose-600' : 'text-rose-400'}`} />
        <span className="font-bold text-lg">Absent</span>
      </button>

    </div>
  );
};

export default ActionButtons;