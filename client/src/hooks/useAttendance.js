import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchHistory, submitAttendance } from '../services/api';
import { formatDateString } from '../utils/dateHelpers';
import { 
  saveLocalHistory, 
  getLocalHistory, 
  addToSyncQueue, 
  getSyncQueue, 
  clearSyncQueue 
} from '../utils/syncManager';

export const useAttendance = () => {
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- 1. SYNC ENGINE: Replay waiting jobs ---
  const processSyncQueue = useCallback(async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    try {
      toast.loading('Syncing offline data...', { id: 'sync' });
      
      // Process all jobs in loop
      for (const job of queue) {
        await submitAttendance(job.date, job.status);
      }
      
      await clearSyncQueue();
      toast.success('Sync Complete!', { id: 'sync' });
      
      // Refresh data from server to be sure
      const serverData = await fetchHistory();
      processServerData(serverData);
      
    } catch (error) {
      toast.error('Sync failed. Will try later.', { id: 'sync' });
    }
  }, []);

  // Helper: Process and Cache Data
  const processServerData = async (dataArray) => {
    const map = {};
    dataArray.forEach(record => {
      map[record.date] = record.status;
    });
    
    setHistory(map);
    await saveLocalHistory(map); // <--- Save to Device immediately
  };

  // --- 2. LOAD LOGIC (Offline First) ---
  const loadHistory = useCallback(async () => {
    // A. Load from Device (Instant)
    const localData = await getLocalHistory();
    if (localData && Object.keys(localData).length > 0) {
      setHistory(localData);
    }

    // B. Try Network (Background)
    try {
      const data = await fetchHistory();
      processServerData(data);
      // If we are online, also check if we have queued items
      processSyncQueue();
    } catch (error) {
      console.log('Network failed, using local data.');
      setIsOffline(true);
    }
  }, [processSyncQueue]);

  // --- 3. MARK LOGIC (Optimistic) ---
  const markToday = async (status) => {
    setLoading(true);
    const todayStr = formatDateString(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );

    // A. Update UI & Local Storage Immediately
    const newHistory = { ...history, [todayStr]: status };
    setHistory(newHistory);
    await saveLocalHistory(newHistory);

    try {
      // B. Try Network
      await submitAttendance(todayStr, status);
      toast.success(`Marked as ${status}!`);
    } catch (error) {
      // C. If Network Fails -> Add to Queue
      console.log('Offline! Queuing request.');
      await addToSyncQueue({ date: todayStr, status });
      toast('Saved offline. Will sync later.', { icon: '📡' });
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  // Network Listener (Auto-sync when internet comes back)
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back Online!');
      processSyncQueue();
      loadHistory();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Load
    loadHistory();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadHistory, processSyncQueue]);

  // Stats Logic
  const stats = useMemo(() => {
    const values = Object.values(history);
    const totalPresent = values.filter(v => v === 'PRESENT').length;
    const totalEntries = values.length;
    return {
      total: totalPresent,
      percentage: totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0
    };
  }, [history]);

  return { history, stats, loading, markToday, isOffline };
};