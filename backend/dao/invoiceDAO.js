const Invoice = require('../models/Invoice');

class InvoiceDAO {
  // Create a new invoice
  async createInvoice(invoiceData) {
    try {
      const invoice = new Invoice(invoiceData);
      return await invoice.save();
    } catch (error) {
      throw new Error(`Error creating invoice: ${error.message}`);
    }
  }

  // Get all invoices
  async getAllInvoices() {
    try {
      return await Invoice.find()
        .populate('orderId', 'orderId itemName quantity totalAmount price status department createdAt')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting invoices: ${error.message}`);
    }
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      return await Invoice.findById(id)
        .populate('orderId', 'orderId itemName quantity totalAmount price status department createdAt')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('verifiedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error getting invoice by ID: ${error.message}`);
    }
  }

  // Get invoices by status
  async getInvoicesByStatus(status) {
    try {
      return await Invoice.find({ status })
        .populate('orderId', 'orderId itemName quantity totalAmount price status department createdAt')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting invoices by status: ${error.message}`);
    }
  }

  // Get invoices by supplier
  async getInvoicesBySupplier(supplierId) {
    try {
      return await Invoice.find({ supplier: supplierId })
        .populate('orderId', 'orderId itemName quantity totalAmount price status department createdAt')
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting invoices by supplier: ${error.message}`);
    }
  }

  // Update invoice status
  async updateInvoiceStatus(id, status, verifiedBy = null) {
    try {
      const updateData = { status };
      if (verifiedBy) {
        updateData.verifiedBy = verifiedBy;
        updateData.verifiedDate = new Date();
      }
      return await Invoice.findByIdAndUpdate(id, updateData, { new: true })
        .populate('orderId', 'orderId itemName quantity totalAmount price status department createdAt')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('verifiedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error updating invoice status: ${error.message}`);
    }
  }

  // Update invoice
  async updateInvoice(id, updateData) {
    try {
      return await Invoice.findByIdAndUpdate(id, updateData, { new: true })
        .populate('orderId', 'orderId itemName quantity totalAmount price status department createdAt')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('verifiedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error updating invoice: ${error.message}`);
    }
  }

  // Delete invoice
  async deleteInvoice(id) {
    try {
      return await Invoice.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting invoice: ${error.message}`);
    }
  }

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      const stats = await Invoice.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      return stats;
    } catch (error) {
      throw new Error(`Error getting invoice stats: ${error.message}`);
    }
  }

  // Add discrepancy to invoice
  async addDiscrepancy(id, discrepancy) {
    try {
      return await Invoice.findByIdAndUpdate(
        id,
        { 
          $push: { discrepancies: discrepancy },
          status: 'Discrepancy'
        },
        { new: true }
      ).populate('orderId', 'orderId itemName quantity totalAmount pricePerTonne pricePerTon status department createdAt')
       .populate('supplier', 'name contact email')
       .populate('verifiedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error adding discrepancy: ${error.message}`);
    }
  }
}

module.exports = new InvoiceDAO();
