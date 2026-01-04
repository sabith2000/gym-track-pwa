const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const helmet = require('helmet'); // <--- NEW: Security Headers
const rateLimit = require('express-rate-limit'); // <--- NEW: DDoS Protection
require('dotenv').config();

const attendanceRoutes = require('./routes/attendanceRoutes');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================
// 1. SECURITY MIDDLEWARE (The Armor)
// =========================================================

// A. Set Secure HTTP Headers
// We disable contentSecurityPolicy because it can sometimes block React scripts/images. 
// We can tune it later if needed.
app.use(helmet({
  contentSecurityPolicy: false, 
}));

// B. Rate Limiting (Prevent Spam)
// Limits all requests to 100 per 15 minutes window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false,
});

// Apply rate limiting specifically to API routes
app.use('/api', limiter);

// =========================================================

app.use(cors());
app.use(express.json());

// 2. API Routes (The Data)
app.use('/api/attendance', attendanceRoutes);

// 3. SERVE FRONTEND (The UI)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// 4. CATCH-ALL HANDLER
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});