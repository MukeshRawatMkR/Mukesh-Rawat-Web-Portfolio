const express = require('express');
const { body } = require('express-validator');
const {
  getBlogPosts,
  getBlogPost,
  syncMediumArticles,
  getSyncStatus,
  getBlogStats,
  updateBlogPost,
  deleteBlogPost,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for blog post updates
const blogUpdateValidation = [
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  body('status')
    .optional()
    .isIn(['published', 'draft', 'archived'])
    .withMessage('Status must be published, draft, or archived'),
];

// Public routes
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPost);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

// Admin blog management routes
router.get('/admin/stats', getBlogStats);
router.put('/:id', blogUpdateValidation, updateBlogPost);
router.delete('/:id', deleteBlogPost);

// Medium sync routes
router.post('/sync', syncMediumArticles);
router.get('/sync/status', getSyncStatus);

module.exports = router;