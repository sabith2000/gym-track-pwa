import React from 'react';
import { FireIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import StatCard from '../ui/StatCard';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-8">
      
      {/* 1. STREAK CARD */}
      <StatCard 
        title="Current Streak" 
        icon={CalendarDaysIcon} 
        color="text-emerald-500 bg-emerald-500"
        badge={`Best: ${stats.bestStreak}`}
      >
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold leading-none text-gray-900">
            {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
          </span>
          <span className="text-xs font-bold text-emerald-600 mt-1 animate-pulse">
            {stats.streakMsg}
          </span>
        </div>
      </StatCard>

      {/* 2. ATTENDANCE RATE */}
      <StatCard 
        title="Attendance Rate" 
        icon={ChartBarIcon} 
        color="text-blue-500 bg-blue-500"
      >
        <div className="flex items-center justify-between divide-x divide-gray-200">
          <div className="pr-4">
            <span className="block text-2xl font-bold text-gray-900">{stats.month.percentage}%</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">This Month</span>
          </div>
          <div className="pl-4">
            <span className="block text-2xl font-bold text-gray-400">{stats.total.percentage}%</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Lifetime</span>
          </div>
        </div>
      </StatCard>

      {/* 3. ACTIVITY LOG */}
      <StatCard 
        title="Activity Log" 
        icon={FireIcon} 
        color="text-orange-500 bg-orange-500"
      >
        <div className="space-y-2 mt-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Month:</span>
            <div className="space-x-2">
              <span className="font-bold text-emerald-600">{stats.month.present} P</span>
              <span className="text-gray-300">|</span>
              <span className="font-bold text-rose-500">{stats.month.absent} A</span>
            </div>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-100 pt-1">
            <span className="text-gray-500 font-medium">Lifetime:</span>
            <div className="space-x-2">
              <span className="font-bold text-emerald-600">{stats.total.present} P</span>
              <span className="text-gray-300">|</span>
              <span className="font-bold text-rose-500">{stats.total.absent} A</span>
            </div>
          </div>
        </div>
      </StatCard>
    </div>
  );
};

export default StatsGrid;