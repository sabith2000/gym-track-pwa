const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- NEW: Import Path
const connectDB = require('./config/db');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendanceRoutes');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. API Routes (The Data)
app.use('/api/attendance', attendanceRoutes);

// 2. SERVE FRONTEND (The UI)
// This tells the server: "Look for the React build files in the client/dist folder"
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// 3. CATCH-ALL HANDLER
// If the user requests a page like /calendar, send them index.html so React can handle it
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});