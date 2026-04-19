const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://project-dashboard-sable.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/statuses', require('./routes/statuses'));
app.use('/api/team', require('./routes/team'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/stats', require('./routes/stats'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const { seedMasterAdmin } = require('./services/seedService');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    await seedMasterAdmin();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err; // Re-throw to prevent server startup on failure
  }
};

const PORT = process.env.PORT || 5000;

// Start server if not running on Vercel
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('❌ Failed to start server due to DB connection error');
      // On some platforms like Render, we might want to exit so the platform can restart the service
      process.exit(1);
    });
} else {
  // Support for serverless (Vercel)
  connectDB().catch(err => console.error('Late DB connection error:', err));
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
