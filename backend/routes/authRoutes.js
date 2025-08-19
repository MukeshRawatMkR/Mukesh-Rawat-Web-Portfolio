const express = require('express');
const { body } = require('express-validator');
const {
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for login
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for profile update
const profileValidation = [
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

// Validation rules for password change
const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Public routes
router.post('/login', loginValidation, login);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/profile', profileValidation, updateProfile);
router.put('/change-password', passwordChangeValidation, changePassword);
router.post('/logout', logout);

module.exports = router;