import React from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const EditStatusModal = ({ isOpen, dateStr, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const dateObj = new Date(dateStr);
  const formattedDate = dateObj.toLocaleDateString('default', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* UPDATED: dark:bg-slate-900, dark:border-slate-800 */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all scale-100 border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Attendance</h3>
            {/* UPDATED: dark:text-[#C7CBD1] */}
            <p className="text-sm text-gray-500 dark:text-[#C7CBD1] dark:opacity-80 font-medium mt-1">{formattedDate}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-slate-800 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 space-y-3">
          {/* Present Button */}
          <button
            onClick={() => onConfirm('PRESENT')}
            className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors group"
          >
            <span className="font-bold">Mark Present</span>
            <CheckCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Absent Button */}
          <button
            onClick={() => onConfirm('ABSENT')}
            className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-2xl border border-rose-100 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors group"
          >
            <span className="font-bold">Mark Absent</span>
            <XCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Cancel Button */}
        <button 
          onClick={onClose}
          className="w-full py-3 text-gray-500 dark:text-slate-400 font-bold hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default EditStatusModal;