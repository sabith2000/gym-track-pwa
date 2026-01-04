import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchHistory, submitAttendance } from '../services/api';
import { useEditSession } from './useEditSession';
import { ATTENDANCE_STATUS } from '../utils/constants'; // <--- Ensure constants are used
import { 
  formatDateString, 
  calculateStreak, 
  calculateBestStreak, 
  calculateStats 
} from '../utils/dateHelpers';
import { 
  saveLocalHistory, 
  getLocalHistory, 
  addToSyncQueue, 
  getSyncQueue, 
  clearSyncQueue 
} from '../utils/syncManager';

export const useAttendance = () => {
  // --- 1. CORE DATA STATE ---
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- 2. IMPORT EDIT LOGIC ---
  const { 
    isEditing, 
    editTimer, 
    touchedDates, 
    startEditSession, 
    endEditSession, 
    registerTouch 
  } = useEditSession();

  // --- 3. STATS ENGINE ---
  const stats = useMemo(() => {
    const { total, month } = calculateStats(history);
    const currentStreak = calculateStreak(history);
    const bestStreak = calculateBestStreak(history);

    let streakMsg = "Start it up! ❄️";
    if (currentStreak >= 3) streakMsg = "Heating up! 🔥";
    if (currentStreak >= 7) streakMsg = "On Fire! 🚀";
    if (currentStreak >= 14) streakMsg = "Unstoppable! 🏆";
    if (currentStreak >= 30) streakMsg = "God Mode! ⚡";

    return { total, month, streak: currentStreak, bestStreak, streakMsg };
  }, [history]);

  // --- 4. DATA OPERATIONS ---
  const markAttendance = async (status, targetDate = null) => {
    setLoading(true);
    
    const todayStr = formatDateString(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    
    const dateToMark = targetDate || todayStr;

    if (targetDate) registerTouch(dateToMark);

    const newHistory = { ...history, [dateToMark]: status };
    setHistory(newHistory);
    await saveLocalHistory(newHistory);

    try {
      await submitAttendance(dateToMark, status);
      if (!targetDate) toast.success(`Marked as ${status}!`);
    } catch (error) {
      await addToSyncQueue({ date: dateToMark, status });
      if (!targetDate) toast('Saved offline.', { icon: '📡' });
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED SYNC ENGINE (Silent Mode Support) ---
  const processSyncQueue = useCallback(async (isBackground = false) => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    try {
      // Only show toast if user triggered it manually
      if (!isBackground) toast.loading('Syncing offline data...', { id: 'sync' });
      
      console.log(`📡 [Sync] Attempting to flush ${queue.length} items...`);
      
      for (const job of queue) {
        await submitAttendance(job.date, job.status);
      }
      
      await clearSyncQueue();
      
      if (!isBackground) toast.success('Sync Complete!', { id: 'sync' });
      
      // Refresh data from server to be sure
      const serverData = await fetchHistory();
      processServerData(serverData);
      
    } catch (error) {
      console.error("❌ [Sync] Failed. Server might be cold.", error);
      // If background sync fails, we just stay quiet and try again in 2 mins
      if (!isBackground) toast.error('Sync failed. Will retry automatically.', { id: 'sync' });
    }
  }, []);

  const processServerData = async (dataArray) => {
    const map = {};
    dataArray.forEach(record => {
      map[record.date] = record.status;
    });
    setHistory(map);
    await saveLocalHistory(map);
  };

  const loadHistory = useCallback(async () => {
    const localData = await getLocalHistory();
    if (localData && Object.keys(localData).length > 0) {
      setHistory(localData);
    }
    try {
      const data = await fetchHistory();
      processServerData(data);
      processSyncQueue(false); // Initial load = visible sync
    } catch (error) {
      console.log('Network failed, using local data.');
      setIsOffline(true);
    }
  }, [processSyncQueue]);

  // --- 5. LIFECYCLE & HEARTBEAT ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back Online!');
      processSyncQueue(false); // Visible sync on reconnect
      loadHistory();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial Load
    loadHistory();

    // 💓 THE HEARTBEAT (Auto-Retry for Render.com)
    // Checks every 2 minutes (120000 ms)
    const heartbeatInterval = setInterval(async () => {
      if (navigator.onLine) {
        const queue = await getSyncQueue();
        if (queue.length > 0) {
          processSyncQueue(true); // TRUE = Silent Background Sync
        }
      }
    }, 120000); 

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeatInterval); // Cleanup timer
    };
  }, [loadHistory, processSyncQueue]);

  return { 
    history, 
    stats, 
    loading, 
    isOffline, 
    markAttendance, 
    refresh: loadHistory,
    isEditing,
    editTimer,
    startEditSession,
    endEditSession,
    touchedDates
  };
};