import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const EditStatusModal = ({ isOpen, onClose, dateStr, onConfirm }) => {
  if (!isOpen) return null;

  const dateDisplay = new Date(dateStr).toLocaleDateString('default', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all translate-y-0">
        
        <h3 className="text-center text-gray-900 font-bold text-lg mb-1">Edit Attendance</h3>
        <p className="text-center text-gray-500 text-sm mb-6">{dateDisplay}</p>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm('PRESENT')}
            className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors group"
          >
            <span className="font-bold">Mark Present</span>
            <CheckCircleIcon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onConfirm('ABSENT')}
            className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors group"
          >
            <span className="font-bold">Mark Absent</span>
            <XCircleIcon className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="w-full p-4 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStatusModal;