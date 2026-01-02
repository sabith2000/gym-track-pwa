import React from 'react';
import { AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const Header = ({ onRefresh, loading }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src="/pwa-192x192.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-xl shadow-sm" 
          />
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">GymTrack</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {/* REFRESH BUTTON */}
          <button 
            type="button"
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full transition-all active:scale-90"
            title="Sync Data"
          >
            <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Settings (Visual Only for now) */}
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <AdjustmentsHorizontalIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;