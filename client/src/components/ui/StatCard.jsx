import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      
      {/* Text Content */}
      <div>
        {/* UPDATED: Changed text-gray-400 to text-gray-500 for better readability */}
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;