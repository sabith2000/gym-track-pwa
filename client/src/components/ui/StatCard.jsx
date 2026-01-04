import React from 'react';

const StatCard = ({ title, icon: Icon, color, children, badge }) => {
  return (
    // UPDATED: Added 'items-center' to vertically align icon with larger text content
    <div className="relative bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 flex items-center space-x-5 transition-transform hover:scale-[1.01]">
      
      {/* Icon - UPDATED: Larger container (p-4) */}
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 shrink-0`}>
        {/* Icon - UPDATED: Larger size (w-8 h-8) */}
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
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