
const express = require('express');
const { body } = require('express-validator');
const {
  createSP,
  getSPByKaryawan,
  getAllSP,
  updateSP,
  deleteSP
} = require('../controllers/spController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all SP
router.get('/', getAllSP);

// Create SP (Admin only)
router.post('/', 
  roleMiddleware(['ADMIN']),
  [
    body('karyawanId').notEmpty().trim(),
    body('alasan').notEmpty().trim()
  ],
  createSP
);

// Get SP by karyawan
router.get('/karyawan/:karyawanId', getSPByKaryawan);

// Update SP (Admin only)
router.put('/:id', 
  roleMiddleware(['ADMIN']),
  [
    body('status').isIn(['AKTIF', 'SELESAI'])
  ],
  updateSP
);

// Delete SP (Admin only)
router.delete('/:id', roleMiddleware(['ADMIN']), deleteSP);

module.exports = router;
