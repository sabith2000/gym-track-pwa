import React from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { changelogData } from '../../data/changelog';

const ChangelogModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Get the latest update (first item)
  const latestUpdate = changelogData[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-[fade-in-up_0.3s_ease-out]">
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  What's New
                </span>
              </div>
              <h3 className="text-2xl font-bold">v{latestUpdate.version}</h3>
              <p className="text-blue-100 text-sm">{latestUpdate.title}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {changelogData.map((log, index) => (
              <div key={log.version} className={`relative ${index !== 0 ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                {/* Connector Line */}
                {index !== changelogData.length - 1 && (
                  <div className="absolute top-8 left-[3.5px] w-0.5 h-full bg-gray-100 dark:bg-slate-800 -z-10" />
                )}
                
                <div className="mb-2 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500">
                    v{log.version} • {log.date}
                  </span>
                </div>

                <ul className="pl-4 space-y-2">
                  {log.changes.map((change, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                      • {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            Awesome, Let's Go! 🚀
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChangelogModal;