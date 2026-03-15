import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useEditSession } from './useEditSession';
import { useAttendanceStats } from './useAttendanceStats';
import { useSyncEngine } from './useSyncEngine';
import { formatDateString } from '../utils/dateHelpers';
import {
  getRecords,
  saveRecords,
  addToQueue,
  getDeviceId,
  getStatusMap,
} from '../utils/syncManager';

export const useAttendance = () => {
  // --- 1. CORE DATA STATE ---
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);

  // --- 2. SUB-HOOKS ---
  const { isOffline, triggerSync, refresh } = useSyncEngine(setHistory);
  const stats = useAttendanceStats(history);
  const {
    isEditing,
    editTimer,
    touchedDates,
    startEditSession,
    endEditSession,
    registerTouch,
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

    try {
      // 1. Build the change record with LWW metadata
      const deviceId = await getDeviceId();
      const change = {
        date: dateToMark,
        status,
        updatedAt: Date.now(),
        deviceId,
      };

      // 2. Optimistic Update — save to IDB records store
      const records = await getRecords();
      records[dateToMark] = {
        status: change.status,
        updatedAt: change.updatedAt,
        deviceId: change.deviceId,
      };
      await saveRecords(records);

      // 3. Update React state immediately (so UI feels instant)
      setHistory(getStatusMap(records));

      // 4. Push to sync queue
      await addToQueue(change);

      // 5. Attempt immediate sync (if online, this pushes to server now)
      await triggerSync(true);

      if (!targetDate) toast.success(`Marked as ${status}!`);
    } catch (error) {
      console.error('markAttendance error:', error);
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
    touchedDates,
  };
};