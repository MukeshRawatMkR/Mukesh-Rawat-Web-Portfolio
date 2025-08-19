const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  mediumId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Blog post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Blog post description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  content: {
    type: String,
    required: [true, 'Blog post content is required'],
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot be more than 300 characters'],
  },
  author: {
    type: String,
    default: 'Mukesh Rawat',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  categories: [{
    type: String,
    trim: true,
  }],
  mediumUrl: {
    type: String,
    required: [true, 'Medium URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid Medium URL',
    },
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL',
    },
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true,
  },
  readingTime: {
    type: Number, // in minutes
    default: 5,
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot be more than 60 characters'],
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters'],
  },
  // Sync tracking
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'synced',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
blogPostSchema.index({ publishedAt: -1, status: 1 });
blogPostSchema.index({ featured: -1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ categories: 1 });
blogPostSchema.index({ createdAt: -1 });

// Virtual for formatted publish date
blogPostSchema.virtual('formattedDate').get(function() {
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Virtual for relative time
blogPostSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.publishedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
});

// Pre-save middleware to generate slug and meta fields
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  if (!this.metaTitle) {
    this.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.metaDescription) {
    this.metaDescription = this.description.substring(0, 160);
  }
  
  if (!this.excerpt) {
    this.excerpt = this.description.substring(0, 300);
  }
  
  next();
});

// Static method to get published posts
blogPostSchema.statics.getPublished = function(options = {}) {
  const { limit = 10, skip = 0, featured = null } = options;
  
  let query = { status: 'published' };
  if (featured !== null) {
    query.featured = featured;
  }
  
  return this.find(query)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get featured posts
blogPostSchema.statics.getFeatured = function(limit = 3) {
  return this.find({ status: 'published', featured: true })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Instance method to increment views
blogPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('BlogPost', blogPostSchema);