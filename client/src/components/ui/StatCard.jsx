import React from 'react';

const StatCard = ({ title, icon: Icon, color, children, badge }) => {
  return (
    // UPDATED: Background, Border, Hover effects for Dark Mode
    <div className="relative bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 flex items-start space-x-4 transition-transform hover:scale-[1.01]">
      
      {/* Icon */}
      <div className={`p-3.5 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 shrink-0`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      
      {/* Content Container */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1 flex justify-between items-center">
          {title}
          {badge && (
            <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-[10px] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </p>
        
        {/* Render Children (For custom layouts) */}
        <div className="text-gray-900 dark:text-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StatCard;