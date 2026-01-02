import React from 'react';

const StatCard = ({ title, icon: Icon, color, children, badge }) => {
  return (
    <div className="relative bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-start space-x-4 transition-transform hover:scale-[1.01]">
      
      {/* Icon */}
      <div className={`p-3.5 rounded-xl ${color} bg-opacity-10 shrink-0`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      
      {/* Content Container */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 flex justify-between items-center">
          {title}
          {/* Top Right Badge (e.g., Best Streak) */}
          {badge && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </p>
        
        {/* Render Children (For custom layouts) */}
        <div className="text-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StatCard;