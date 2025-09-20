const feedTypeDAO = require('../dao/feedTypeDAO');

class FeedTypeController {
  // Create a new feed type
  async createFeedType(req, res) {
    try {
      const {
        name,
        pricePerTon,
        pricePerTonne,
        description,
        category,
        isActive
      } = req.body;

      const feedTypeData = {
        name,
        pricePerTonne: pricePerTon || pricePerTonne,
        description,
        category,
        isActive: isActive !== undefined ? isActive : true
      };

      const feedType = await feedTypeDAO.createFeedType(feedTypeData);

      res.status(201).json({
        success: true,
        message: 'Feed type created successfully',
        data: { feedType }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all feed types
  async getAllFeedTypes(req, res) {
    try {
      const feedTypes = await feedTypeDAO.getAllFeedTypes();
      res.json({
        success: true,
        data: { feedTypes }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get feed type by ID
  async getFeedTypeById(req, res) {
    try {
      const { id } = req.params;
      const feedType = await feedTypeDAO.getFeedTypeById(id);
      
      if (!feedType) {
        return res.status(404).json({
          success: false,
          message: 'Feed type not found'
        });
      }

      res.json({
        success: true,
        data: { feedType }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get feed types by category
  async getFeedTypesByCategory(req, res) {
    try {
      const { category } = req.params;
      const feedTypes = await feedTypeDAO.getFeedTypesByCategory(category);
      res.json({
        success: true,
        data: { feedTypes }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update feed type
  async updateFeedType(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const feedType = await feedTypeDAO.updateFeedType(id, updateData);
      
      if (!feedType) {
        return res.status(404).json({
          success: false,
          message: 'Feed type not found'
        });
      }

      res.json({
        success: true,
        message: 'Feed type updated successfully',
        data: { feedType }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete feed type
  async deleteFeedType(req, res) {
    try {
      const { id } = req.params;
      const feedType = await feedTypeDAO.deleteFeedType(id);
      
      if (!feedType) {
        return res.status(404).json({
          success: false,
          message: 'Feed type not found'
        });
      }

      res.json({
        success: true,
        message: 'Feed type deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get feed type statistics
  async getFeedTypeStats(req, res) {
    try {
      const stats = await feedTypeDAO.getFeedTypeStats();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new FeedTypeController();
