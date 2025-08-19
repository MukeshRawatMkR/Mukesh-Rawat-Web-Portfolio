const Project = require('../models/Project');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all active projects
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res) => {
  try {
    const { 
      featured, 
      limit = 20, 
      page = 1, 
      sort = '-createdAt',
      search 
    } = req.query;

    // Build query
    let query = { status: 'active' };
    
    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Project.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: projects.length,
      totalResults: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: {
        projects,
      },
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching projects',
    });
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || project.status !== 'active') {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        project,
      },
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error fetching project',
    });
  }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private (Admin only)
 */
const createProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const project = await Project.create(req.body);

    logger.info(`New project created: ${project.title} by user ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    logger.error('Error creating project:', error);

    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error creating project',
    });
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin only)
 */
const updateProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    logger.info(`Project updated: ${project.title} by user ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    logger.error('Error updating project:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error updating project',
    });
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin only)
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    logger.info(`Project deleted: ${project.title} by user ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting project:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error deleting project',
    });
  }
};

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats
 * @access  Private (Admin only)
 */
const getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalProjects = await Project.countDocuments();
    const featuredProjects = await Project.countDocuments({ featured: true });
    const activeProjects = await Project.countDocuments({ status: 'active' });

    res.status(200).json({
      status: 'success',
      data: {
        totalProjects,
        featuredProjects,
        activeProjects,
        statusBreakdown: stats,
      },
    });
  } catch (error) {
    logger.error('Error fetching project statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching project statistics',
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
};