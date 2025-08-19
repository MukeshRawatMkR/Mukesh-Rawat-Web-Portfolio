const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  imageURL: {
    type: String,
    required: [true, 'Project image URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL',
    },
  },
  techStack: {
    type: [String],
    required: [true, 'At least one technology is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Tech stack cannot be empty',
    },
  },
  githubURL: {
    type: String,
    required: [true, 'GitHub URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
      },
      message: 'Please provide a valid GitHub URL',
    },
  },
  liveDemoURL: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid demo URL',
    },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'draft'],
    default: 'active',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
projectSchema.index({ status: 1, order: 1 });
projectSchema.index({ featured: -1, createdAt: -1 });

// Virtual for formatted creation date
projectSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Pre-save middleware to ensure featured projects have higher order
projectSchema.pre('save', function(next) {
  if (this.featured && this.order === 0) {
    this.order = 1000; // High priority for featured projects
  }
  next();
});

// Static method to get featured projects
projectSchema.statics.getFeatured = function() {
  return this.find({ featured: true, status: 'active' })
    .sort({ order: -1, createdAt: -1 })
    .limit(3);
};

// Static method to get all active projects
projectSchema.statics.getActive = function() {
  return this.find({ status: 'active' })
    .sort({ order: -1, createdAt: -1 });
};

module.exports = mongoose.model('Project', projectSchema);