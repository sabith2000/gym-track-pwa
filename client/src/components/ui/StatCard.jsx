import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.01]">
      {/* Icon Container - Made slightly larger */}
      <div className={`p-3.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      
      {/* Text Content */}
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;