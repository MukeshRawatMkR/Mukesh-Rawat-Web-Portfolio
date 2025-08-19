const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for project creation/update
const projectValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
    .trim(),
  body('imageURL')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  body('techStack.*')
    .notEmpty()
    .withMessage('Technology stack items cannot be empty')
    .trim(),
  body('githubURL')
    .notEmpty()
    .withMessage('GitHub URL is required')
    .isURL()
    .withMessage('Please provide a valid GitHub URL')
    .matches(/^https?:\/\/(www\.)?github\.com\/.*/)
    .withMessage('Please provide a valid GitHub URL'),
  body('liveDemoURL')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid demo URL'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'draft'])
    .withMessage('Status must be active, archived, or draft'),
];

// Public routes
router.get('/', getProjects);
router.get('/stats', protect, authorize('admin'), getProjectStats);
router.get('/:id', getProject);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', projectValidation, createProject);
router.put('/:id', projectValidation, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;