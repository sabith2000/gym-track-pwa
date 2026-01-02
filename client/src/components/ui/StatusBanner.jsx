import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const StatusBanner = ({ isEditing, timer, customMessage }) => {
  // PRIORITY 1: Edit Mode (Red Alert)
  if (isEditing) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center animate-fade-in">
        <div className="p-2 bg-red-100 rounded-full mr-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-800">Edit Mode Active</p>
          <p className="text-xs text-red-600 font-medium">
            Session closes in {timer} seconds
          </p>
        </div>
      </div>
    );
  }

  // PRIORITY 2: Custom Message (Blue Info) - Only shows if you type something
  if (customMessage) {
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center">
        <div className="p-2 bg-blue-100 rounded-full mr-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-blue-800">
          {customMessage}
        </p>
      </div>
    );
  }

  // If nothing is active, return null (or an empty div with height if you want fixed spacing)
  return null; 
};

export default StatusBanner;