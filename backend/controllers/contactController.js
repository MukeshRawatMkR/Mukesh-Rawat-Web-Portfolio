const ContactMessage = require('../models/ContactMessage');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactForm = async (req, res) => {
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

    const { name, email, message } = req.body;

    // Create contact message with additional metadata
    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });

    // Log the new contact message
    logger.info(`New contact message from ${name} (${email})`);

    // Don't send sensitive information back to client
    const responseData = {
      id: contactMessage._id,
      name: contactMessage.name,
      email: contactMessage.email,
      message: contactMessage.message,
      createdAt: contactMessage.createdAt,
    };

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully! I\'ll get back to you soon.',
      data: {
        contactMessage: responseData,
      },
    });

    // TODO: Here you could add email notification logic
    // sendEmailNotification(contactMessage);

  } catch (error) {
    logger.error('Error submitting contact form:', error);

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
      message: 'There was an error sending your message. Please try again.',
    });
  }
};

/**
 * @desc    Get all contact messages
 * @route   GET /api/contact/messages
 * @access  Private (Admin only)
 */
const getContactMessages = async (req, res) => {
  try {
    const {
      status,
      limit = 20,
      page = 1,
      sort = '-createdAt',
      search,
    } = req.query;

    // Build query
    let query = {};

    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const messages = await ContactMessage.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ContactMessage.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: messages.length,
      totalResults: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: {
        messages,
      },
    });
  } catch (error) {
    logger.error('Error fetching contact messages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contact messages',
    });
  }
};

/**
 * @desc    Get single contact message
 * @route   GET /api/contact/messages/:id
 * @access  Private (Admin only)
 */
const getContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    // Mark as read if it's new
    if (message.status === 'new') {
      await message.markAsRead();
    }

    res.status(200).json({
      status: 'success',
      data: {
        message,
      },
    });
  } catch (error) {
    logger.error('Error fetching contact message:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error fetching contact message',
    });
  }
};

/**
 * @desc    Update contact message status
 * @route   PATCH /api/contact/messages/:id
 * @access  Private (Admin only)
 */
const updateContactMessage = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (status && !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
      });
    }

    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    // Update fields
    if (status) message.status = status;
    if (notes !== undefined) message.notes = notes;

    // Handle replied status
    if (status === 'replied' && !message.replied) {
      message.replied = true;
      message.repliedAt = new Date();
    }

    await message.save();

    logger.info(`Contact message ${message._id} updated by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Contact message updated successfully',
      data: {
        message,
      },
    });
  } catch (error) {
    logger.error('Error updating contact message:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error updating contact message',
    });
  }
};

/**
 * @desc    Delete contact message
 * @route   DELETE /api/contact/messages/:id
 * @access  Private (Admin only)
 */
const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    logger.info(`Contact message deleted by ${req.user.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Contact message deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting contact message:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error deleting contact message',
    });
  }
};

/**
 * @desc    Get contact message statistics
 * @route   GET /api/contact/stats
 * @access  Private (Admin only)
 */
const getContactStats = async (req, res) => {
  try {
    const stats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalMessages = await ContactMessage.countDocuments();
    const newMessages = await ContactMessage.countDocuments({ status: 'new' });
    const repliedMessages = await ContactMessage.countDocuments({ replied: true });

    res.status(200).json({
      status: 'success',
      data: {
        totalMessages,
        newMessages,
        repliedMessages,
        statusBreakdown: stats,
      },
    });
  } catch (error) {
    logger.error('Error fetching contact statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contact statistics',
    });
  }
};

module.exports = {
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
  getContactStats,
};