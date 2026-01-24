import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
      // OPTIONAL: Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // Only show if there is an update (needRefresh) or offline ready message
  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-[slide-up_0.3s_ease-out]">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
        
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
              {offlineReady ? 'Ready to work offline' : 'New version available'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {offlineReady 
                ? 'App content is saved for offline use.' 
                : 'Click reload to update to the latest version.'}
            </p>
          </div>
          <button 
            onClick={close}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 animate-spin-slow" />
            <span>Reload & Update</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ReloadPrompt;