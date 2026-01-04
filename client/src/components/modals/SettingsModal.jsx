import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, MoonIcon, SunIcon, ArrowDownTrayIcon, WifiIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAttendance } from '../../hooks/useAttendance';
import { generateExcelReport } from '../../utils/exportHelper';
import pkg from '../../../package.json';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { history, stats, isOffline } = useAttendance(); // Get stats too for the report
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (isOffline) {
      toast.error("Connect to internet to download report.");
      return;
    }
    
    if (Object.keys(history).length === 0) {
      toast("No history to export yet!", { icon: '📝' });
      return;
    }

    setExporting(true);
    try {
      // Pass stats along with history
      await generateExcelReport(history, stats);
      toast.success("Report Downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#C7CBD1]">Settings</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#C7CBD1] rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-orange-100 text-orange-500'}`}>
                {theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </div>
              <span className="font-medium text-gray-900 dark:text-[#C7CBD1]">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
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

          {/* Export Button - UPDATED LOGIC */}
          <button 
            onClick={handleExport}
            disabled={isOffline || exporting}
            className={`
              w-full flex items-center justify-between p-4 rounded-2xl transition-all border border-transparent
              ${isOffline 
                ? 'bg-gray-100 dark:bg-slate-800/50 opacity-50 cursor-not-allowed grayscale' // Offline: Greyed out but visible
                : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-[0.98]'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isOffline ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'}`}>
                {/* Always show Download Icon unless offline icon is preferred, but user asked for "everything" to be same */}
                <ArrowDownTrayIcon className="w-5 h-5" />
              </div>
              
              <div className="text-left">
                <span className={`block font-medium ${isOffline ? 'text-gray-500' : 'text-gray-900 dark:text-[#C7CBD1]'}`}>
                  Export History
                </span>
                {/* Updated Message */}
                {isOffline && (
                  <span className="text-[10px] text-gray-500 font-semibold">
                    Internet required for Export
                  </span>
                )}
              </div>
            </div>

            {exporting ? (
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              !isOffline && <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">XLSX</span>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-[#C7CBD1] opacity-60">
            GymTrack v{pkg.version} • Local Storage Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;