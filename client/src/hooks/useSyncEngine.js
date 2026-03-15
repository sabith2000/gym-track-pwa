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
  clearAllLocalData,
} from '../utils/syncManager';

// --- RETRY CONFIG ---
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 3000; // 3s → 9s → 27s

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error) => {
  // Don't retry client errors (4xx) — only server/network errors
  const status = error?.response?.status;
  if (status && status >= 400 && status < 500) return false;
  return true;
};

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

        // 2. Call server (with retry)
        let response;
        let lastError;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            response = await syncWithServer({
              lastSyncTimestamp,
              deviceId,
              changes: queue,
            });
            break; // Success — exit retry loop
          } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES && isRetryable(error)) {
              const delay = BASE_DELAY_MS * Math.pow(3, attempt);
              console.warn(
                `⚠️ [Sync] Attempt ${attempt + 1}/${MAX_RETRIES} failed. Retrying in ${delay / 1000}s...`
              );
              await sleep(delay);
            }
          }
        }

        if (!response) {
          throw lastError; // All retries exhausted
        }

        // 3. Handle server-side reset
        if (response.wasReset) {
          console.log('🗑️ [Sync] Server reset detected — wiping local data.');
          await clearAllLocalData();

          // Rebuild local records from server's current state
          const freshRecords = {};
          for (const update of response.updates || []) {
            freshRecords[update.date] = {
              status: update.status,
              updatedAt: update.updatedAt,
              deviceId: update.deviceId,
            };
          }
          await saveRecords(freshRecords);
          await saveLastSyncTimestamp(response.serverTimestamp);
          setHistory(getStatusMap(freshRecords));

          toast.success('Data synced from server.', { id: 'sync' });
          console.log(
            `✅ [Sync] Reset sync complete. Got ${(response.updates || []).length} record(s) from server.`
          );
          return; // Done — skip normal merge path
        }

        // 4. Remove only the items we just sent (safe for mid-sync edits)
        if (queue.length > 0) {
          await removeFromQueue(queue);
        }

        // 5. Merge server updates into local records (LWW)
        const localRecords = await getRecords();
        const mergedRecords = mergeServerUpdates(
          localRecords,
          response.updates || []
        );
        await saveRecords(mergedRecords);

        // 6. Save the new sync cursor
        await saveLastSyncTimestamp(response.serverTimestamp);

        // 7. Update React state
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