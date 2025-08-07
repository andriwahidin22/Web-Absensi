const express = require('express');
const { body } = require('express-validator');
const {
  getAllAbsensi,
  createAbsensi,
  getAbsensiStats
} = require('../controllers/absensiController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware only to protected routes
router.use('/stats', authMiddleware);

// Get all absensi - public access for main page
router.get('/', getAllAbsensi);

// Get absensi statistics
router.get('/stats', getAbsensiStats);

// Create absensi (check in/out) - public access for attendance
router.post('/', [
  body('qrCode').optional().trim(),
  body('manualCode').optional().trim()
], createAbsensi);

module.exports = router;