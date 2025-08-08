const express = require('express');
const { body } = require('express-validator');
const {
  generateReport,
  exportPDF,
  exportCSV
} = require('../controllers/reportController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Generate report data
router.post('/generate', 
  roleMiddleware(['ADMIN', 'BOS']),
  [
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('reportType').isIn(['kehadiran', 'keterlambatan', 'rekap-bulanan', 'absensi-detail'])
  ],
  generateReport
);

// Export to PDF
router.post('/export/pdf', 
  roleMiddleware(['ADMIN', 'BOS']),
  [
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('reportType').isIn(['kehadiran', 'keterlambatan', 'rekap-bulanan', 'absensi-detail'])
  ],
  exportPDF
);

// Export to CSV
router.post('/export/csv', 
  roleMiddleware(['ADMIN', 'BOS']),
  [
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('reportType').isIn(['kehadiran', 'keterlambatan', 'rekap-bulanan', 'absensi-detail'])
  ],
  exportCSV
);

module.exports = router;