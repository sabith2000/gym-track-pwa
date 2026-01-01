import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">GymTrack</h1>
        </div>

        {/* Settings / Actions */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <AdjustmentsHorizontalIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;