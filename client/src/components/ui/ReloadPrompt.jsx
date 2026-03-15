import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Local dismiss state — doesn't clear needRefresh, so we can re-show later
  const [dismissed, setDismissed] = useState(false);

  // Hourly SW update check (with proper cleanup)
  useEffect(() => {
    let intervalId;

    // Use the navigator.serviceWorker to check for updates
    const startUpdateCheck = async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        intervalId = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    };

    startUpdateCheck();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Re-show banner when user returns to the app (tab focus / app reopen)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && needRefresh) {
        setDismissed(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [needRefresh]);

  const close = useCallback(() => {
    setOfflineReady(false);
    setDismissed(true);
  }, [setOfflineReady]);

  // Show if: (offline ready AND not dismissed) OR (update available AND not dismissed)
  const showOfflineMsg = offlineReady && !dismissed;
  const showUpdateMsg = needRefresh && !dismissed;

  if (!showOfflineMsg && !showUpdateMsg) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-[slide-up_0.3s_ease-out]">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
        
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
              {showOfflineMsg ? 'Ready to work offline' : 'New version available'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {showOfflineMsg 
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

        {showUpdateMsg && (
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