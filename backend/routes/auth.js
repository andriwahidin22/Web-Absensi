
const express = require('express');
const { body } = require('express-validator');
const { login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], login);

// Get profile
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
