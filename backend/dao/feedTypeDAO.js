const FeedType = require('../models/FeedType');

class FeedTypeDAO {
  // Create a new feed type
  async createFeedType(feedTypeData) {
    try {
      const feedType = new FeedType(feedTypeData);
      return await feedType.save();
    } catch (error) {
      throw new Error(`Error creating feed type: ${error.message}`);
    }
  }

  // Get all feed types
  async getAllFeedTypes() {
    try {
      return await FeedType.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      throw new Error(`Error getting feed types: ${error.message}`);
    }
  }

  // Get feed type by ID
  async getFeedTypeById(id) {
    try {
      return await FeedType.findById(id);
    } catch (error) {
      throw new Error(`Error getting feed type by ID: ${error.message}`);
    }
  }

  // Get feed types by category
  async getFeedTypesByCategory(category) {
    try {
      return await FeedType.find({ 
        category,
        isActive: true 
      }).sort({ name: 1 });
    } catch (error) {
      throw new Error(`Error getting feed types by category: ${error.message}`);
    }
  }

  // Update feed type
  async updateFeedType(id, updateData) {
    try {
      return await FeedType.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new Error(`Error updating feed type: ${error.message}`);
    }
  }

  // Delete feed type (soft delete)
  async deleteFeedType(id) {
    try {
      return await FeedType.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } catch (error) {
      throw new Error(`Error deleting feed type: ${error.message}`);
    }
  }

  // Get feed type statistics
  async getFeedTypeStats() {
    try {
      const stats = await FeedType.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricePerTonne' }
          }
        }
      ]);
      return stats;
    } catch (error) {
      throw new Error(`Error getting feed type stats: ${error.message}`);
    }
  }
}

module.exports = new FeedTypeDAO();
