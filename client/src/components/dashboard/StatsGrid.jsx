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
          <span className="text-3xl font-extrabold leading-none text-gray-900 dark:text-[#C7CBD1]">
            {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 animate-pulse">
            {stats.streakMsg}
          </span>
        </div>
      </StatCard>

      {/* 2. CONSISTENCY SCORE */}
      <StatCard 
        title="Consistency Score" 
        icon={ChartBarIcon} 
        color="text-blue-500 bg-blue-500"
      >
        <div className="flex items-center justify-between divide-x divide-gray-200 dark:divide-slate-700">
          <div className="pr-4 flex-1">
            <span className="block text-3xl font-extrabold text-gray-900 dark:text-[#C7CBD1]">
              {stats.month.percentage}%
            </span>
            <span className="text-[11px] text-gray-400 dark:text-[#C7CBD1] dark:opacity-60 font-bold uppercase tracking-wide">
              This Month
            </span>
          </div>
          <div className="pl-4 flex-1">
            <span className="block text-3xl font-bold text-gray-400 dark:text-[#C7CBD1] dark:opacity-50">
              {stats.total.percentage}%
            </span>
            <span className="text-[11px] text-gray-400 dark:text-[#C7CBD1] dark:opacity-40 font-bold uppercase tracking-wide">
              All Time
            </span>
          </div>
        </div>
      </StatCard>

      {/* 3. MONTHLY BREAKDOWN (Colors Updated) */}
      <StatCard 
        title="Monthly Breakdown" 
        icon={FireIcon} 
        color="text-orange-500 bg-orange-500"
      >
        <div className="mt-2 space-y-3">
          
          {/* Workouts Row - EMERALD GREEN */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-[#C7CBD1] dark:opacity-90">
              ✅ Workouts
            </span>
            <div className="flex items-baseline space-x-1">
              {/* Distinct Color for Number */}
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.month.present}
              </span>
              {/* Matching Tint for Label */}
              <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">
                days
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-slate-800" />

          {/* Rest Days Row - ROSE RED */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-[#C7CBD1] dark:opacity-90">
              💤 Rest Days
            </span>
            <div className="flex items-baseline space-x-1">
              {/* Distinct Color for Number */}
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {stats.month.absent}
              </span>
              {/* Matching Tint for Label */}
              <span className="text-xs font-bold text-rose-600/70 dark:text-rose-400/70 uppercase">
                days
              </span>
            </div>
          </div>

        </div>
      </StatCard>
    </div>
  );
};

export default StatsGrid;