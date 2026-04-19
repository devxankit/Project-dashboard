const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/statuses', require('./routes/statuses'));
app.use('/api/team', require('./routes/team'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/stats', require('./routes/stats'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const { seedMasterAdmin } = require('./services/seedService');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    await seedMasterAdmin();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

// Start server if not running on Vercel
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
} else {
  // Ensure DB connects for serverless handlers (Vercel)
  connectDB();
}

module.exports = app;
