
const express = require('express');
const { body } = require('express-validator');
const {
  processAbsensi,
  getAllAbsensi,
  getAbsensiStats
} = require('../controllers/absensiController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Process absensi (public route)
router.post('/', [
  body('qrCode').notEmpty().trim()
], processAbsensi);

// Apply auth middleware to protected routes
router.use(authMiddleware);

// Get all absensi (Admin/Bos)
router.get('/', getAllAbsensi);

// Get absensi stats
router.get('/stats', getAbsensiStats);

module.exports = router;
