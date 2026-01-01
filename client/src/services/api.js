import axios from 'axios';

// Create a configured "Phone Line" to the backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // The address of your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- API FUNCTIONS ---

// 1. Get History (The Calendar Data)
export const fetchHistory = async () => {
  const response = await api.get('/attendance');
  return response.data;
};

// 2. Mark Attendance (Present/Absent)
export const submitAttendance = async (date, status) => {
  const response = await api.post('/attendance', { date, status });
  return response.data;
};

export default api;