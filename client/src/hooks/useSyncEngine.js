import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { syncWithServer } from '../services/api';
import {
  getRecords,
  saveRecords,
  getQueue,
  removeFromQueue,
  getLastSyncTimestamp,
  saveLastSyncTimestamp,
  getDeviceId,
  getStatusMap,
  mergeServerUpdates,
} from '../utils/syncManager';

export const useSyncEngine = (setHistory) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const syncInProgress = useRef(false); // Prevents overlapping syncs

  // --- CORE SYNC LOOP ---
  const performSync = useCallback(
    async (isBackground = false) => {
      // Guard: don't overlap syncs
      if (syncInProgress.current) return;
      if (!navigator.onLine) return;

      syncInProgress.current = true;

      try {
        // 1. Gather local state
        const [queue, lastSyncTimestamp, deviceId] = await Promise.all([
          getQueue(),
          getLastSyncTimestamp(),
          getDeviceId(),
        ]);

        if (!isBackground && queue.length > 0) {
          toast.loading('Syncing...', { id: 'sync' });
        }

        console.log(
          `📡 [Sync] Sending ${queue.length} change(s), cursor: ${lastSyncTimestamp}`
        );

        // 2. Call server
        const response = await syncWithServer({
          lastSyncTimestamp,
          deviceId,
          changes: queue,
        });

        // 3. Remove only the items we just sent (safe for mid-sync edits)
        if (queue.length > 0) {
          await removeFromQueue(queue);
        }

        // 4. Merge server updates into local records (LWW)
        const localRecords = await getRecords();
        const mergedRecords = mergeServerUpdates(
          localRecords,
          response.updates || []
        );
        await saveRecords(mergedRecords);

        // 5. Save the new sync cursor
        await saveLastSyncTimestamp(response.serverTimestamp);

        // 6. Update React state
        setHistory(getStatusMap(mergedRecords));

        if (!isBackground && queue.length > 0) {
          toast.success('Sync Complete!', { id: 'sync' });
        }

        console.log(
          `✅ [Sync] Done. Got ${(response.updates || []).length} update(s) from server.`
        );
      } catch (error) {
        console.error('❌ [Sync] Failed:', error.message || error);
        if (!isBackground) {
          toast.error('Sync failed. Will retry.', { id: 'sync' });
        }
      } finally {
        syncInProgress.current = false;
      }
    },
    [setHistory]
  );

  // --- INITIAL LOAD (fast local → then sync) ---
  const loadAndSync = useCallback(async () => {
    // 1. Instantly show local data (feels fast)
    const localRecords = await getRecords();
    if (Object.keys(localRecords).length > 0) {
      setHistory(getStatusMap(localRecords));
    }

    // 2. Run a sync to get fresh data
    await performSync(false);
  }, [performSync, setHistory]);

  // --- LIFECYCLE LISTENERS ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back Online!');
      performSync(false);
    };

    const handleOffline = () => setIsOffline(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        console.log('👁️ Tab Focused: Syncing...');
        performSync(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial load + sync
    loadAndSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadAndSync, performSync]);

  return {
    isOffline,
    triggerSync: performSync, // Exposed for post-edit immediate sync
    refresh: loadAndSync,     // Exposed for manual pull-to-refresh
  };
};