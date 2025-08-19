const express = require('express');
const { body } = require('express-validator');
const {
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
  getContactStats,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for contact form
const contactValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .trim()
    .escape(),
];

// Public route - submit contact form
router.post('/', contactValidation, submitContactForm);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/messages', getContactMessages);
router.get('/stats', getContactStats);
router.get('/messages/:id', getContactMessage);
router.patch('/messages/:id', updateContactMessage);
router.delete('/messages/:id', deleteContactMessage);

module.exports = router;