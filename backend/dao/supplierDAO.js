const Supplier = require('../models/Supplier');

class SupplierDAO {
  // Create a new supplier
  async createSupplier(supplierData) {
    try {
      const supplier = new Supplier(supplierData);
      return await supplier.save();
    } catch (error) {
      throw new Error(`Error creating supplier: ${error.message}`);
    }
  }

  // Get all suppliers
  async getAllSuppliers() {
    try {
      return await Supplier.find({ status: 'Active' }).sort({ name: 1 });
    } catch (error) {
      throw new Error(`Error getting suppliers: ${error.message}`);
    }
  }

  // Get supplier by ID
  async getSupplierById(id) {
    try {
      return await Supplier.findById(id);
    } catch (error) {
      throw new Error(`Error getting supplier by ID: ${error.message}`);
    }
  }

  // Get suppliers by speciality
  async getSuppliersBySpeciality(speciality) {
    try {
      return await Supplier.find({ 
        speciality: { $regex: speciality, $options: 'i' },
        status: 'Active'
      }).sort({ name: 1 });
    } catch (error) {
      throw new Error(`Error getting suppliers by speciality: ${error.message}`);
    }
  }

  // Update supplier
  async updateSupplier(id, updateData) {
    try {
      return await Supplier.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new Error(`Error updating supplier: ${error.message}`);
    }
  }

  // Delete supplier (soft delete)
  async deleteSupplier(id) {
    try {
      return await Supplier.findByIdAndUpdate(id, { status: 'Inactive' }, { new: true });
    } catch (error) {
      throw new Error(`Error deleting supplier: ${error.message}`);
    }
  }

  // Update supplier rating
  async updateSupplierRating(id, rating) {
    try {
      return await Supplier.findByIdAndUpdate(
        id, 
        { rating }, 
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating supplier rating: ${error.message}`);
    }
  }

  // Get supplier statistics
  async getSupplierStats() {
    try {
      const stats = await Supplier.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]);
      return stats;
    } catch (error) {
      throw new Error(`Error getting supplier stats: ${error.message}`);
    }
  }
}

module.exports = new SupplierDAO();
