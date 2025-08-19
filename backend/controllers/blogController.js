const BlogPost = require('../models/BlogPost');
const mediumService = require('../services/mediumService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all blog posts with pagination and filtering
 * @route   GET /api/blog
 * @access  Public
 */
const getBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      featured,
      tags,
      categories,
      search,
      sort = '-publishedAt',
    } = req.query;

    // Build query
    let query = { status: 'published' };

    if (featured === 'true') {
      query.featured = true;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (categories) {
      const categoryArray = categories.split(',').map(cat => cat.trim());
      query.categories = { $in: categoryArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Execute query with pagination
    const posts = await BlogPost.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-content'); // Exclude full content for list view

    const total = await BlogPost.countDocuments(query);

    // Get featured posts if not filtering
    let featuredPosts = [];
    if (!featured && !tags && !categories && !search && page == 1) {
      featuredPosts = await BlogPost.getFeatured(3);
    }

    res.status(200).json({
      status: 'success',
      results: posts.length,
      totalResults: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: {
        posts,
        featuredPosts: featuredPosts.length > 0 ? featuredPosts : undefined,
      },
    });
  } catch (error) {
    logger.error('Error fetching blog posts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching blog posts',
    });
  }
};

/**
 * @desc    Get single blog post by slug
 * @route   GET /api/blog/:slug
 * @access  Public
 */
const getBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ 
      slug, 
      status: 'published' 
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog post not found',
      });
    }

    // Increment view count
    await post.incrementViews();

    // Get related posts
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      status: 'published',
      $or: [
        { tags: { $in: post.tags } },
        { categories: { $in: post.categories } },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('-content');

    res.status(200).json({
      status: 'success',
      data: {
        post,
        relatedPosts,
      },
    });
  } catch (error) {
    logger.error('Error fetching blog post:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Blog post not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error fetching blog post',
    });
  }
};

/**
 * @desc    Sync articles from Medium
 * @route   POST /api/blog/sync
 * @access  Private (Admin only)
 */
const syncMediumArticles = async (req, res) => {
  try {
    logger.info(`Medium sync initiated by user ${req.user.username}`);
    
    const result = await mediumService.syncArticles();

    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Medium articles synced successfully',
        data: result,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: result.message || 'Failed to sync Medium articles',
        data: result,
      });
    }
  } catch (error) {
    logger.error('Error syncing Medium articles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error syncing Medium articles',
    });
  }
};

/**
 * @desc    Get sync status
 * @route   GET /api/blog/sync/status
 * @access  Private (Admin only)
 */
const getSyncStatus = async (req, res) => {
  try {
    const status = mediumService.getSyncStatus();
    
    // Get last sync info from database
    const lastSyncedPost = await BlogPost.findOne()
      .sort({ lastSyncedAt: -1 })
      .select('lastSyncedAt syncStatus');

    res.status(200).json({
      status: 'success',
      data: {
        ...status,
        lastSync: lastSyncedPost?.lastSyncedAt || null,
        lastSyncStatus: lastSyncedPost?.syncStatus || null,
      },
    });
  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting sync status',
    });
  }
};

/**
 * @desc    Get blog statistics
 * @route   GET /api/blog/stats
 * @access  Private (Admin only)
 */
const getBlogStats = async (req, res) => {
  try {
    const totalPosts = await BlogPost.countDocuments({ status: 'published' });
    const featuredPosts = await BlogPost.countDocuments({ 
      status: 'published', 
      featured: true 
    });
    const draftPosts = await BlogPost.countDocuments({ status: 'draft' });
    
    const totalViews = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const totalLikes = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);

    const recentPosts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title publishedAt views');

    const topTags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalPosts,
        featuredPosts,
        draftPosts,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        recentPosts,
        topTags,
      },
    });
  } catch (error) {
    logger.error('Error fetching blog statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching blog statistics',
    });
  }
};

/**
 * @desc    Update blog post (admin only)
 * @route   PUT /api/blog/:id
 * @access  Private (Admin only)
 */
const updateBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { featured, status } = req.body;
    const updateData = {};

    if (featured !== undefined) updateData.featured = featured;
    if (status !== undefined) updateData.status = status;

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog post not found',
      });
    }

    logger.info(`Blog post updated: ${post.title} by user ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Blog post updated successfully',
      data: { post },
    });
  } catch (error) {
    logger.error('Error updating blog post:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Blog post not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error updating blog post',
    });
  }
};

/**
 * @desc    Delete blog post (admin only)
 * @route   DELETE /api/blog/:id
 * @access  Private (Admin only)
 */
const deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog post not found',
      });
    }

    logger.info(`Blog post deleted: ${post.title} by user ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting blog post:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Blog post not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error deleting blog post',
    });
  }
};

module.exports = {
  getBlogPosts,
  getBlogPost,
  syncMediumArticles,
  getSyncStatus,
  getBlogStats,
  updateBlogPost,
  deleteBlogPost,
};