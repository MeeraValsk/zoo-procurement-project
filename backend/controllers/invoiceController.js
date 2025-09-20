const invoiceDAO = require('../dao/invoiceDAO');
const orderDAO = require('../dao/orderDAO');

class InvoiceController {
  // Create a new invoice
  async createInvoice(req, res) {
    try {
      const {
        orderId,
        customer,
        amount,
        items,
        invoiceNumber,
        dueDate,
        notes
      } = req.body;

      const supplier = req.user.userId;
      const invoiceId = `INV-${Date.now().toString().slice(-6)}`;

      const invoiceData = {
        invoiceId,
        orderId,
        supplier,
        customer,
        amount,
        items,
        invoiceNumber,
        dueDate,
        verificationNotes: notes
      };

      const invoice = await invoiceDAO.createInvoice(invoiceData);
      const populatedInvoice = await invoiceDAO.getInvoiceById(invoice._id);

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: { invoice: populatedInvoice }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all invoices
  async getAllInvoices(req, res) {
    try {
      const invoices = await invoiceDAO.getAllInvoices();
      res.json({
        success: true,
        data: { invoices }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get invoice by ID
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceDAO.getInvoiceById(id);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: { invoice }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get invoices by status
  async getInvoicesByStatus(req, res) {
    try {
      const { status } = req.params;
      const invoices = await invoiceDAO.getInvoicesByStatus(status);
      res.json({
        success: true,
        data: { invoices }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get invoices by supplier
  async getInvoicesBySupplier(req, res) {
    try {
      const supplierId = req.user.userId;
      const invoices = await invoiceDAO.getInvoicesBySupplier(supplierId);
      res.json({
        success: true,
        data: { invoices }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update invoice status
  async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, verificationNotes } = req.body;
      const verifiedBy = req.user.userId;

      const updateData = { status };
      if (verificationNotes) {
        updateData.verificationNotes = verificationNotes;
      }

      const invoice = await invoiceDAO.updateInvoice(id, updateData);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice status updated successfully',
        data: { invoice }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verify invoice
  async verifyInvoice(req, res) {
    try {
      const { id } = req.params;
      const { verificationNotes } = req.body;
      const verifiedBy = req.user.userId;

      const invoice = await invoiceDAO.updateInvoiceStatus(id, 'Verified', verifiedBy);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice verified successfully',
        data: { invoice }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add discrepancy to invoice
  async addDiscrepancy(req, res) {
    try {
      const { id } = req.params;
      const { discrepancy } = req.body;

      const invoice = await invoiceDAO.addDiscrepancy(id, discrepancy);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Discrepancy added successfully',
        data: { invoice }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update invoice
  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const invoice = await invoiceDAO.updateInvoice(id, updateData);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: { invoice }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete invoice
  async deleteInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceDAO.deleteInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get invoice statistics
  async getInvoiceStats(req, res) {
    try {
      const stats = await invoiceDAO.getInvoiceStats();
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

module.exports = new InvoiceController();
