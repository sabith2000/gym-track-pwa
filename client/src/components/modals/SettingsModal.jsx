import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, MoonIcon, SunIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { generateExcelReport } from '../../utils/exportHelper';
import api from '../../services/api';
import { clearAllLocalData } from '../../utils/syncManager';
import pkg from '../../../package.json';
import ConfirmDialog from './ConfirmDialog'; // <--- Import New Component

const SettingsModal = ({ isOpen, onClose, isOffline }) => {
  const { theme, toggleTheme } = useTheme();
  
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // New State for Modal
  const [isDeleting, setIsDeleting] = useState(false);

  // --- EXPORT LOGIC ---
  const handleExport = async () => {
    if (isOffline) {
      toast.error("Connect to internet to download report.");
      return;
    }
    setExporting(true);
    try {
      await generateExcelReport();
      toast.success("Report Downloaded!");
    } catch (error) {
      if (error.message === "NoHistory") {
        toast("No history to export yet!", { icon: '📝' });
      } else {
        console.error(error);
        toast.error("Export failed. Try again.");
      }
    } finally {
      setExporting(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (isOffline) {
        toast.error("Connect to internet to reset data.");
        setIsDeleting(false);
        return;
      }
      
      await api.delete('/attendance'); // Call Backend
      await clearAllLocalData(); // Wipe local IDB (records, queue, timestamp)
      
      toast.success("History Reset Successfully");
      setTimeout(() => {
        window.location.reload(); 
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Reset failed.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MAIN SETTINGS MODAL */}
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-[#C7CBD1]">Settings</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#C7CBD1] rounded-full">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            
            {/* 1. Theme Toggle */}
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

            {/* 2. Export Button */}
            <button 
              onClick={handleExport}
              disabled={isOffline || exporting}
              className={`
                w-full flex items-center justify-between p-4 rounded-2xl transition-all border border-transparent
                ${isOffline 
                  ? 'bg-gray-100 dark:bg-slate-800/50 opacity-50 cursor-not-allowed grayscale' 
                  : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-[0.98]'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isOffline ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'}`}>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className={`block font-medium ${isOffline ? 'text-gray-500' : 'text-gray-900 dark:text-[#C7CBD1]'}`}>
                    Export History
                  </span>
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

            {/* 3. DANGER ZONE ☢️ */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
               <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-600 tracking-wider mb-3">
                 Danger Zone
               </p>
               <button 
                 onClick={() => setShowDeleteConfirm(true)} // Open Confirmation Dialog
                 className="w-full flex items-center justify-between p-4 rounded-2xl transition-all border bg-red-50 dark:bg-red-900/10 text-red-600 border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-[0.98]"
               >
                 <div className="flex items-center space-x-3">
                   <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                     <TrashIcon className="w-5 h-5" />
                   </div>
                   <span className="font-bold">Reset History</span>
                 </div>
               </button>
            </div>

          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-[#C7CBD1] opacity-60">
              Gym-Log v{pkg.version} • {isOffline ? 'Offline Mode' : 'Online Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION OVERLAY */}
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="Reset All History?"
        message="This will permanently delete all your tracking data. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default SettingsModal;