import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { submitAttendance } from '../services/api';
import { useEditSession } from './useEditSession';
import { useAttendanceStats } from './useAttendanceStats';
import { useSyncEngine } from './useSyncEngine';
import { formatDateString } from '../utils/dateHelpers';
import { saveLocalHistory, addToSyncQueue } from '../utils/syncManager';

export const useAttendance = () => {
  // --- 1. CORE DATA STATE ---
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);

  // --- 2. SUB-HOOKS ---
  // Sync Engine handles all network/offline logic
  // Note: ensure useSyncEngine uses reconcileData() internally for fetches!
  const { isOffline, refresh } = useSyncEngine(setHistory);
  
  // Stats Hook handles all calculation logic
  const stats = useAttendanceStats(history);

  // Edit Hook handles UI modes
  const { 
    isEditing, editTimer, touchedDates, 
    startEditSession, endEditSession, registerTouch 
  } = useEditSession();

  // --- 3. USER ACTIONS ---
  const markAttendance = async (status, targetDate = null) => {
    setLoading(true);
    
    const todayStr = formatDateString(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    
    const dateToMark = targetDate || todayStr;
    if (targetDate) registerTouch(dateToMark);

    // Optimistic Update (Immediate UI Change)
    const newHistory = { ...history, [dateToMark]: status };
    setHistory(newHistory);
    // CRITICAL: We save to local immediately so reconcileData can see it later
    await saveLocalHistory(newHistory);

    try {
      await submitAttendance(dateToMark, status);
      if (!targetDate) toast.success(`Marked as ${status}!`);
    } catch (error) {
      await addToSyncQueue({ date: dateToMark, status });
      if (!targetDate) toast('Saved offline.', { icon: '📡' });
    } finally {
      setLoading(false);
    }
  };

  return { 
    history, 
    stats, 
    loading, 
    isOffline, 
    markAttendance, 
    refresh,
    isEditing,
    editTimer,
    startEditSession,
    endEditSession,
    touchedDates
  };
};