import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  
  // --- EDIT MODE STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTimer, setEditTimer] = useState(0); // Seconds remaining
  const [touchedDates, setTouchedDates] = useState(new Set()); // Tracks dates edited in THIS session
  const timerRef = useRef(null);

  // 1. Start Edit Session
  const startEditSession = () => {
    setIsEditing(true);
    setEditTimer(60);
    setTouchedDates(new Set()); // Reset restriction list
    toast.success('Edit Mode Unlocked');

    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Start Countdown
    timerRef.current = setInterval(() => {
      setEditTimer((prev) => {
        if (prev <= 1) {
          endEditSession(); // Auto-lock at 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 2. End Edit Session (Manual or Auto)
  const endEditSession = () => {
    setIsEditing(false);
    setEditTimer(0);
    setTouchedDates(new Set());
    if (timerRef.current) clearInterval(timerRef.current);
    toast('Edit Mode Locked', { icon: '🔒' });
  };

  // 3. Mark Function (Updated with Restriction Logic)
  const markAttendance = async (status, targetDate = null) => {
    setLoading(true);
    
    const todayStr = formatDateString(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    
    const dateToMark = targetDate || todayStr;

    // RULE: If in Edit Mode, add to "Touched List" to prevent re-editing
    if (targetDate && isEditing) {
      setTouchedDates(prev => new Set(prev).add(dateToMark));
    }

    // Standard Save Logic...
    const newHistory = { ...history, [dateToMark]: status };
    setHistory(newHistory);
    await saveLocalHistory(newHistory);

    try {
      await submitAttendance(dateToMark, status);
      // Only show toast for today's action to avoid double toasts with Modals
      if (!targetDate) toast.success(`Marked as ${status}!`);
    } catch (error) {
      await addToSyncQueue({ date: dateToMark, status });
      if (!targetDate) toast('Saved offline.', { icon: '📡' });
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  // --- SYNC ENGINE (Standard) ---
  const processSyncQueue = useCallback(async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;
    try {
      for (const job of queue) await submitAttendance(job.date, job.status);
      await clearSyncQueue();
      const serverData = await fetchHistory();
      processServerData(serverData);
    } catch (error) { console.error(error); }
  }, []);

  const processServerData = async (dataArray) => {
    const map = {};
    dataArray.forEach(record => map[record.date] = record.status);
    setHistory(map);
    await saveLocalHistory(map);
  };

  const loadHistory = useCallback(async () => {
    const localData = await getLocalHistory();
    if (localData) setHistory(localData);
    try {
      const data = await fetchHistory();
      processServerData(data);
      processSyncQueue();
    } catch (error) { setIsOffline(true); }
  }, [processSyncQueue]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Stats
  const stats = useMemo(() => {
    const values = Object.values(history);
    const totalPresent = values.filter(v => v === 'PRESENT').length;
    const totalEntries = values.length;
    return {
      total: totalPresent,
      percentage: totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0
    };
  }, [history]);

  return { 
    history, 
    stats, 
    loading, 
    markAttendance,
    refresh: loadHistory,
    // Edit Exports
    isEditing,
    editTimer,
    startEditSession,
    endEditSession,
    touchedDates // Exported to check validity
  };
};