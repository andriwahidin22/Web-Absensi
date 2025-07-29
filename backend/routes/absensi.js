
const express = require('express');
const { body } = require('express-validator');
const {
  getAllAbsensi,
  createAbsensi,
  getAbsensiStats
} = require('../controllers/absensiController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all absensi
router.get('/', getAllAbsensi);

// Get absensi statistics
router.get('/stats', getAbsensiStats);

// Create absensi (check in/out)
router.post('/', [
  body('qrCode').optional().trim(),
  body('manualCode').optional().trim()
], createAbsensi);

module.exports = router;
