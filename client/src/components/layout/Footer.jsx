import React from 'react';
import pkg from '../../../package.json';

const Footer = () => {
  // --- CONFIG: Change your name here ---
  const CREATOR_NAME = "LMS"; 

  return (
    <footer className="w-full mt-auto py-8">
      <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center space-y-3 text-center">
        
        {/* 1. The Personal Touch (Crisper, Darker, Larger) */}
        <p className="text-sm font-semibold text-slate-700 tracking-wide">
          Made with <span className="text-red-600 mx-0.5 animate-pulse">❤️</span> by <span className="text-slate-900 font-extrabold">{CREATOR_NAME}</span>
        </p>

        {/* 2. The Technical Details (Clearer contrast) */}
        <div className="flex items-center space-x-3 text-xs font-medium text-slate-500">
          <span className="hover:text-slate-700 transition-colors">© 2026 GymTrack</span>
          <span className="text-slate-300">•</span>
          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            v{pkg.version}
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;