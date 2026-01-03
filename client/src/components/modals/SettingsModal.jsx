import React from 'react';
import { XMarkIcon, MoonIcon, SunIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import pkg from '../../../package.json';

const SettingsModal = ({ isOpen, onClose }) => {
  // DIRECT CONNECTION - Removed the "safety" checks that were hiding the issue
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          {/* UPDATED: dark:text-[#C7CBD1] */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#C7CBD1]">Settings</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#C7CBD1] rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Option 1: Dark Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-orange-100 text-orange-500'}`}>
                {theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </div>
              {/* UPDATED: dark:text-[#C7CBD1] */}
              <span className="font-medium text-gray-900 dark:text-[#C7CBD1]">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Option 2: Export Data (Coming Soon) */}
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl opacity-50 cursor-not-allowed">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <ArrowDownTrayIcon className="w-5 h-5" />
              </div>
              {/* UPDATED: dark:text-[#C7CBD1] */}
              <span className="font-medium text-gray-900 dark:text-[#C7CBD1]">Export CSV (Soon)</span>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          {/* UPDATED: dark:text-[#C7CBD1] */}
          <p className="text-xs text-gray-400 dark:text-[#C7CBD1] opacity-60">
            GymTrack v{pkg.version} • Local Storage Only
          </p>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;