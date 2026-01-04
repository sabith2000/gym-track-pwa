import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { fetchHistory, submitAttendance } from '../services/api';
import { 
  saveLocalHistory, 
  getLocalHistory, 
  getSyncQueue, 
  clearSyncQueue 
} from '../utils/syncManager';

export const useSyncEngine = (setHistory) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- 1. CORE SYNC LOGIC ---
  const processServerData = async (dataArray) => {
    const map = {};
    dataArray.forEach(record => {
      map[record.date] = record.status;
    });
    setHistory(map);
    await saveLocalHistory(map);
  };

  const processSyncQueue = useCallback(async (isBackground = false) => {
    const queue = await getSyncQueue();
    
    // A. Upload Pending Data
    if (queue.length > 0) {
      try {
        if (!isBackground) toast.loading('Syncing offline data...', { id: 'sync' });
        console.log(`📡 [Sync] Attempting to flush ${queue.length} items...`);
        
        for (const job of queue) {
          await submitAttendance(job.date, job.status);
        }
        
        await clearSyncQueue();
        if (!isBackground) toast.success('Sync Complete!', { id: 'sync' });
      } catch (error) {
        console.error("❌ [Sync] Failed.", error);
        if (!isBackground) toast.error('Sync failed. Will retry automatically.', { id: 'sync' });
        return; 
      }
    }

    // B. Smart Polling (Download New Data)
    try {
      const serverData = await fetchHistory();
      processServerData(serverData);
    } catch (e) {
      console.log('Silent fetch failed (offline or server cold)');
    }
  }, [setHistory]);

  const loadHistory = useCallback(async () => {
    // 1. Load Local (Fast)
    const localData = await getLocalHistory();
    if (localData && Object.keys(localData).length > 0) {
      setHistory(localData);
    }
    // 2. Fetch Server (Fresh)
    try {
      const data = await fetchHistory();
      processServerData(data);
      processSyncQueue(false); 
    } catch (error) {
      console.log('Network failed, using local data.');
      setIsOffline(true);
    }
  }, [processSyncQueue, setHistory]);

  // --- 2. LIFECYCLE LISTENERS ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back Online!');
      processSyncQueue(false);
      loadHistory();
    };
    const handleOffline = () => setIsOffline(true);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        console.log('👁️ Tab Focused: Refreshing Data...');
        processSyncQueue(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    loadHistory(); // Initial Load

    // Heartbeat (2 mins)
    const heartbeatInterval = setInterval(() => {
      if (navigator.onLine) processSyncQueue(true);
    }, 120000); 

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeatInterval);
    };
  }, [loadHistory, processSyncQueue]);

  return { isOffline, refresh: loadHistory };
};