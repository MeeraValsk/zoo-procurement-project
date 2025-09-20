const supplierDAO = require('../dao/supplierDAO');

class SupplierController {
  // Create a new supplier
  async createSupplier(req, res) {
    try {
      const {
        name,
        contact,
        email,
        phone,
        speciality,
        address,
        website,
        notes
      } = req.body;

      const supplierData = {
        name,
        contact,
        email,
        phone,
        speciality,
        address,
        website,
        notes
      };

      const supplier = await supplierDAO.createSupplier(supplierData);

      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: { supplier }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all suppliers
  async getAllSuppliers(req, res) {
    try {
      const suppliers = await supplierDAO.getAllSuppliers();
      res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get supplier by ID
  async getSupplierById(req, res) {
    try {
      const { id } = req.params;
      const supplier = await supplierDAO.getSupplierById(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }

      res.json({
        success: true,
        data: { supplier }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get suppliers by speciality
  async getSuppliersBySpeciality(req, res) {
    try {
      const { speciality } = req.params;
      const suppliers = await supplierDAO.getSuppliersBySpeciality(speciality);
      res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update supplier
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const supplier = await supplierDAO.updateSupplier(id, updateData);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }

      res.json({
        success: true,
        message: 'Supplier updated successfully',
        data: { supplier }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update supplier rating
  async updateSupplierRating(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      const supplier = await supplierDAO.updateSupplierRating(id, rating);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }

      res.json({
        success: true,
        message: 'Supplier rating updated successfully',
        data: { supplier }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete supplier
  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      const supplier = await supplierDAO.deleteSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get supplier statistics
  async getSupplierStats(req, res) {
    try {
      const stats = await supplierDAO.getSupplierStats();
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

module.exports = new SupplierController();
