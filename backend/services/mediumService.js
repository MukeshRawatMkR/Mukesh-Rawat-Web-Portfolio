const Parser = require('rss-parser');
const BlogPost = require('../models/BlogPost');
const logger = require('../utils/logger');

class MediumService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'content'],
          ['dc:creator', 'creator'],
          ['atom:updated', 'updated'],
        ]
      }
    });
    
    // Medium RSS URL - replace with your Medium username
    this.mediumRssUrl = process.env.MEDIUM_RSS_URL || 'https://medium.com/feed/@yourusername';
    this.syncInProgress = false;
  }

  /**
   * Fetch articles from Medium RSS feed
   */
  async fetchMediumArticles() {
    try {
      logger.info('Fetching articles from Medium RSS feed');
      const feed = await this.parser.parseURL(this.mediumRssUrl);
      
      if (!feed || !feed.items) {
        throw new Error('Invalid RSS feed response');
      }

      logger.info(`Fetched ${feed.items.length} articles from Medium`);
      return feed.items;
    } catch (error) {
      logger.error('Error fetching Medium articles:', error);
      throw new Error(`Failed to fetch Medium articles: ${error.message}`);
    }
  }

  /**
   * Parse Medium article data
   */
  parseMediumArticle(item) {
    try {
      // Extract content and create excerpt
      const content = item.content || item['content:encoded'] || '';
      const plainTextContent = content.replace(/<[^>]*>/g, '');
      
      // Calculate reading time (average 200 words per minute)
      const wordCount = plainTextContent.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Extract image from content
      const imageMatch = content.match(/<img[^>]+src="([^">]+)"/);
      const imageUrl = imageMatch ? imageMatch[1] : null;

      // Generate unique Medium ID from GUID
      const mediumId = this.generateMediumId(item.guid || item.link);

      return {
        mediumId,
        title: item.title?.trim() || 'Untitled',
        description: item.contentSnippet?.trim() || plainTextContent.substring(0, 500),
        content: content,
        excerpt: plainTextContent.substring(0, 300),
        author: item.creator || item['dc:creator'] || 'Mukesh Rawat',
        mediumUrl: item.link,
        imageUrl: imageUrl,
        publishedAt: new Date(item.pubDate || item.isoDate),
        readingTime: readingTime,
        tags: this.extractTags(item.categories || []),
        categories: this.extractCategories(item.categories || []),
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
      };
    } catch (error) {
      logger.error('Error parsing Medium article:', error);
      throw new Error(`Failed to parse article: ${error.message}`);
    }
  }

  /**
   * Generate unique Medium ID from GUID or URL
   */
  generateMediumId(guid) {
    if (!guid) return null;
    
    // Extract Medium post ID from URL if possible
    const mediumIdMatch = guid.match(/\/([a-f0-9]+)$/);
    if (mediumIdMatch) {
      return mediumIdMatch[1];
    }
    
    // Fallback: create hash from GUID
    return Buffer.from(guid).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  }

  /**
   * Extract tags from categories
   */
  extractTags(categories) {
    if (!Array.isArray(categories)) return [];
    
    return categories
      .filter(cat => typeof cat === 'string')
      .map(cat => cat.toLowerCase().trim())
      .slice(0, 10); // Limit to 10 tags
  }

  /**
   * Extract categories from categories (same as tags for Medium)
   */
  extractCategories(categories) {
    return this.extractTags(categories).slice(0, 5); // Limit to 5 categories
  }

  /**
   * Sync articles from Medium to database
   */
  async syncArticles() {
    if (this.syncInProgress) {
      logger.warn('Sync already in progress, skipping');
      return { success: false, message: 'Sync already in progress' };
    }

    this.syncInProgress = true;
    let syncedCount = 0;
    let errorCount = 0;

    try {
      logger.info('Starting Medium articles sync');
      
      const mediumArticles = await this.fetchMediumArticles();
      
      for (const item of mediumArticles) {
        try {
          const articleData = this.parseMediumArticle(item);
          
          if (!articleData.mediumId) {
            logger.warn('Skipping article without Medium ID:', articleData.title);
            continue;
          }

          // Check if article already exists
          const existingArticle = await BlogPost.findOne({ 
            mediumId: articleData.mediumId 
          });

          if (existingArticle) {
            // Update existing article if it's newer
            const existingDate = new Date(existingArticle.publishedAt);
            const newDate = new Date(articleData.publishedAt);
            
            if (newDate > existingDate || 
                existingArticle.syncStatus === 'failed' ||
                (Date.now() - existingArticle.lastSyncedAt) > 24 * 60 * 60 * 1000) { // 24 hours
              
              await BlogPost.findByIdAndUpdate(existingArticle._id, {
                ...articleData,
                views: existingArticle.views, // Preserve view count
                likes: existingArticle.likes, // Preserve like count
                featured: existingArticle.featured, // Preserve featured status
              });
              
              logger.info(`Updated article: ${articleData.title}`);
              syncedCount++;
            }
          } else {
            // Create new article
            await BlogPost.create(articleData);
            logger.info(`Created new article: ${articleData.title}`);
            syncedCount++;
          }
        } catch (error) {
          logger.error(`Error syncing article: ${item.title}`, error);
          errorCount++;
          
          // Try to mark as failed if we have the ID
          try {
            const articleData = this.parseMediumArticle(item);
            if (articleData.mediumId) {
              await BlogPost.findOneAndUpdate(
                { mediumId: articleData.mediumId },
                { syncStatus: 'failed', lastSyncedAt: new Date() },
                { upsert: false }
              );
            }
          } catch (markError) {
            logger.error('Error marking article as failed:', markError);
          }
        }
      }

      logger.info(`Sync completed: ${syncedCount} synced, ${errorCount} errors`);
      
      return {
        success: true,
        syncedCount,
        errorCount,
        totalProcessed: mediumArticles.length,
      };
    } catch (error) {
      logger.error('Error during Medium sync:', error);
      return {
        success: false,
        error: error.message,
        syncedCount,
        errorCount,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      inProgress: this.syncInProgress,
      lastSync: null, // This could be stored in a separate collection
    };
  }

  /**
   * Force sync (ignores in-progress check)
   */
  async forcSync() {
    this.syncInProgress = false;
    return await this.syncArticles();
  }
}

module.exports = new MediumService();