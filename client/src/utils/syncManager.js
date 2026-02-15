import { get, set } from 'idb-keyval';

const QUEUE_KEY = 'offline-sync-queue';
const DATA_KEY = 'gym-history-cache';

// 1. Save Attendance Locally (The Source of Truth)
export const saveLocalHistory = async (data) => {
  await set(DATA_KEY, data);
};

export const getLocalHistory = async () => {
  return (await get(DATA_KEY)) || {};
};

// 2. Add a job to the Sync Queue
export const addToSyncQueue = async (job) => {
  const queue = (await get(QUEUE_KEY)) || [];
  // Avoid duplicates in queue for the same date
  const filteredQueue = queue.filter(q => q.date !== job.date);
  filteredQueue.push(job); 
  await set(QUEUE_KEY, filteredQueue);
};

// 3. Get all waiting jobs
export const getSyncQueue = async () => {
  return (await get(QUEUE_KEY)) || [];
};

// 4. Clear queue after success
export const clearSyncQueue = async () => {
  await set(QUEUE_KEY, []);
};

// 5. NEW: Robust Merge Logic (The Fix for Data Loss) 🛡️
export const reconcileData = async (serverData) => {
  const localData = (await get(DATA_KEY)) || {};
  
  // LOGIC: Server Data is the base, but Local Data overwrites it.
  // This ensures that if you were offline and marked 'Present', 
  // the empty server data won't wipe your 'Present' status.
  const mergedData = { ...serverData, ...localData };
  
  // Save this combined truth back to storage
  await set(DATA_KEY, mergedData);
  return mergedData;
};