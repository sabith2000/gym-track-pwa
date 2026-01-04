import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="relative bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 flex items-center space-x-5 animate-pulse">
      
      {/* Icon Placeholder */}
      <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
      
      {/* Content Placeholder */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Title Bar */}
        <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
        
        {/* Big Number Area */}
        <div className="flex items-baseline space-x-2 pt-1">
           <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-16" />
           <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-8" />
        </div>
      </div>

    </div>
  );
};

export default SkeletonCard;