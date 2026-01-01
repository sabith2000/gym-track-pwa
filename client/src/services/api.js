import axios from 'axios';

// 1. Determine the correct URL
// If we are in Production (Render), use relative path "/api"
// If we are in Development (Laptop), use "http://localhost:5000/api"
const BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5000/api';

// 2. Create the Phone Line
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- API FUNCTIONS ---

export const fetchHistory = async () => {
  const response = await api.get('/attendance');
  return response.data;
};

export const submitAttendance = async (date, status) => {
  const response = await api.post('/attendance', { date, status });
  return response.data;
};

export default api;