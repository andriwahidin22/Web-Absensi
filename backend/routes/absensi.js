const express = require('express');
const { body } = require('express-validator');
const {
  getAllAbsensi,
  createAbsensi,
  getAbsensiStats
} = require('../controllers/absensiController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all routes except createAbsensi (untuk demo)
router.use('/stats', authMiddleware);
router.use('/', (req, res, next) => {
  // Allow createAbsensi without auth for public access
  if (req.method === 'POST') {
    next();
  } else {
    authMiddleware(req, res, next);
  }
});

// Get all absensi
router.get('/', getAllAbsensi);

// Get absensi statistics
router.get('/stats', getAbsensiStats);

// Create absensi (check in/out) - public access for attendance
router.post('/', [
  body('qrCode').optional().trim(),
  body('manualCode').optional().trim()
], createAbsensi);

module.exports = router;