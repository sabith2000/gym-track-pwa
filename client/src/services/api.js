import axios from 'axios';

// 1. Determine the correct URL
// If we are in Production (Render), use relative path "/api"
// If we are in Development (Laptop), use "http://localhost:5000/api"
const BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:5000/api';

// 2. Create the Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- API FUNCTIONS ---

// Bi-directional sync (CRDT-lite LWW)
export const syncWithServer = async (payload) => {
  const response = await api.post('/attendance/sync', payload);
  return response.data;
};

// Keep default export for SettingsModal (api.delete('/attendance'))
export default api;