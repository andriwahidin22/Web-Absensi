
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const karyawanRoutes = require('./routes/karyawan');
const absensiRoutes = require('./routes/absensi');
const spRoutes = require('./routes/sp');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/karyawan', karyawanRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/sp', spRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
