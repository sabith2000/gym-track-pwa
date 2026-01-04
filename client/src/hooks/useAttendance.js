import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { fetchHistory, submitAttendance } from '../services/api';
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
  // --- STATE ---
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // <--- We track this already
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editTimer, setEditTimer] = useState(0); 
  const [touchedDates, setTouchedDates] = useState(new Set());
  const timerRef = useRef(null);

  // ============================================================
  // 1. STATS ENGINE
  // ============================================================
  const stats = useMemo(() => {
    const { total, month } = calculateStats(history);
    const currentStreak = calculateStreak(history);
    const bestStreak = calculateBestStreak(history);

    let streakMsg = "Start it up! ❄️";
    if (currentStreak >= 3) streakMsg = "Heating up! 🔥";
    if (currentStreak >= 7) streakMsg = "On Fire! 🚀";
    if (currentStreak >= 14) streakMsg = "Unstoppable! 🏆";
    if (currentStreak >= 30) streakMsg = "God Mode! ⚡";

    return {
      total, month, streak: currentStreak, bestStreak, streakMsg
    };
  }, [history]);

  // ============================================================
  // 2. EDIT SESSION LOGIC
  // ============================================================
  const startEditSession = () => {
    setIsEditing(true);
    setEditTimer(60);
    setTouchedDates(new Set()); 
    toast.success('Edit Mode Unlocked');

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setEditTimer((prev) => {
        if (prev <= 1) {
          endEditSession(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endEditSession = () => {
    setIsEditing(false);
    setEditTimer(0);
    setTouchedDates(new Set());
    if (timerRef.current) clearInterval(timerRef.current);
    toast('Edit Mode Locked', { icon: '🔒' });
  };

  // ============================================================
  // 3. CORE ACTIONS (Mark & Sync)
  // ============================================================
  const markAttendance = async (status, targetDate = null) => {
    setLoading(true);
    
    const todayStr = formatDateString(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    
    const dateToMark = targetDate || todayStr;

    if (targetDate && isEditing) {
      setTouchedDates(prev => new Set(prev).add(dateToMark));
    }

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
    isOffline, // <--- EXPORTED NOW
    markAttendance, 
    refresh: loadHistory,
    isEditing,
    editTimer,
    startEditSession,
    endEditSession,
    touchedDates
  };
};