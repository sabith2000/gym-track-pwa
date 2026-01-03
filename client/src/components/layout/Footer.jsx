import React from 'react';
import pkg from '../../../package.json';

const Footer = () => {
  const CREATOR_NAME = "LMS"; 

  return (
    <footer className="w-full mt-auto py-8">
      <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center space-y-3 text-center">
        
        {/* 1. The Personal Touch */}
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-400 tracking-wide">
          Made with <span className="text-red-600 mx-0.5 animate-pulse">❤️</span> by <span className="text-slate-900 dark:text-[#ccff00] font-extrabold">{CREATOR_NAME}</span>
        </p>

        {/* 2. The Technical Details */}
        <div className="flex items-center space-x-3 text-xs font-medium text-slate-500 dark:text-slate-600">
          <span className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors">© 2026 GymTrack</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          {/* UPDATED: Dark mode pill colors */}
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
            v{pkg.version}
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;