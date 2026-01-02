import React, { useState } from 'react';
import { LockClosedIcon, LockOpenIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import PinModal from '../modals/PinModal';

const Header = ({ onRefresh, loading, isEditing, onUnlock, onLock }) => {
  const [showPinModal, setShowPinModal] = useState(false);

  const handleLockClick = () => {
    if (isEditing) {
      onLock();
    } else {
      setShowPinModal(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <img src="/pwa-192x192.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-sm" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">GymTrack</h1>
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full active:scale-90"
            >
              <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button 
              onClick={handleLockClick}
              className={`p-2 rounded-full transition-colors ${
                isEditing 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              {isEditing ? <LockOpenIcon className="w-6 h-6" /> : <LockClosedIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)}
        onSuccess={onUnlock}
      />
    </>
  );
};

export default Header;