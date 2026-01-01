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
  queue.push(job); // job = { date: '2026-01-02', status: 'PRESENT' }
  await set(QUEUE_KEY, queue);
};

// 3. Get all waiting jobs
export const getSyncQueue = async () => {
  return (await get(QUEUE_KEY)) || [];
};

// 4. Clear queue after success
export const clearSyncQueue = async () => {
  await set(QUEUE_KEY, []);
};