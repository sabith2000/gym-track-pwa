import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchHistory, submitAttendance } from '../services/api';
import { useEditSession } from './useEditSession'; // <--- Import New Hook
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

    // Delegate touch tracking to the sub-hook
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

  const processSyncQueue = useCallback(async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    try {
      toast.loading('Syncing offline data...', { id: 'sync' });
      for (const job of queue) {
        await submitAttendance(job.date, job.status);
      }
      await clearSyncQueue();
      toast.success('Sync Complete!', { id: 'sync' });
      const serverData = await fetchHistory();
      processServerData(serverData);
    } catch (error) {
      toast.error('Sync failed. Will try later.', { id: 'sync' });
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
      processSyncQueue();
    } catch (error) {
      console.log('Network failed, using local data.');
      setIsOffline(true);
    }
  }, [processSyncQueue]);

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
    loadHistory();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadHistory, processSyncQueue]);

  return { 
    history, 
    stats, 
    loading, 
    isOffline, 
    markAttendance, 
    refresh: loadHistory,
    // Pass through the edit values
    isEditing,
    editTimer,
    startEditSession,
    endEditSession,
    touchedDates
  };
};