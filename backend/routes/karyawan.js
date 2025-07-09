
const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const {
  getAllKaryawan,
  getKaryawanById,
  createKaryawan,
  updateKaryawan,
  deleteKaryawan,
  generateQRCode
} = require('../controllers/karyawanController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all karyawan
router.get('/', getAllKaryawan);

// Get karyawan by ID
router.get('/:id', getKaryawanById);

// Create karyawan (Admin only)
router.post('/', 
  roleMiddleware(['ADMIN']), 
  upload.single('foto'),
  [
    body('nip').notEmpty().trim(),
    body('nama').notEmpty().trim(),
    body('jabatan').notEmpty().trim(),
    body('divisi').notEmpty().trim()
  ],
  createKaryawan
);

// Update karyawan (Admin only)
router.put('/:id', 
  roleMiddleware(['ADMIN']), 
  upload.single('foto'),
  [
    body('nama').notEmpty().trim(),
    body('jabatan').notEmpty().trim(),
    body('divisi').notEmpty().trim()
  ],
  updateKaryawan
);

// Delete karyawan (Admin only)
router.delete('/:id', roleMiddleware(['ADMIN']), deleteKaryawan);

// Generate QR Code
router.get('/:id/qrcode', generateQRCode);

module.exports = router;
