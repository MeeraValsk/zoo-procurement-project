const orderDAO = require('../dao/orderDAO');
const { v4: uuidv4 } = require('uuid');

class OrderController {
  // Create a new order
  async createOrder(req, res) {
    try {
      const {
        itemName,
        quantity,
        price,
        reason,
        supplier,
        feedType,
        priority = 'Medium',
        department,
        deliveryAddress,
        contactPerson,
        phone
      } = req.body;

      const requester = req.user.userId;
      const totalAmount = quantity * price;
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;

      const orderData = {
        orderId,
        itemName,
        quantity,
        price,
        totalAmount,
        reason,
        supplier,
        feedType,
        priority,
        requester,
        department,
        deliveryAddress,
        contactPerson,
        phone
      };

      const order = await orderDAO.createOrder(orderData);
      const populatedOrder = await orderDAO.getOrderById(order._id);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order: populatedOrder }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all orders
  async getAllOrders(req, res) {
    try {
      const orders = await orderDAO.getAllOrders();
      res.json({
        success: true,
        data: { orders }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderDAO.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by requester
  async getOrdersByRequester(req, res) {
    try {
      const requesterId = req.user.userId;
      const orders = await orderDAO.getOrdersByRequester(requesterId);
      res.json({
        success: true,
        data: { orders }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by supplier
  async getOrdersBySupplier(req, res) {
    try {
      const supplierId = req.user.userId;
      const orders = await orderDAO.getOrdersBySupplier(supplierId);
      res.json({
        success: true,
        data: { orders }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by status
  async getOrdersByStatus(req, res) {
    try {
      const { status } = req.params;
      const orders = await orderDAO.getOrdersByStatus(status);
      res.json({
        success: true,
        data: { orders }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const approvedBy = req.user.userId;

      const order = await orderDAO.updateOrderStatus(id, status, approvedBy);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // If order status is changed to "Delivered", automatically create an invoice
      if (status === "Delivered") {
        try {
          const invoiceDAO = require('../dao/invoiceDAO');
          
          // Generate unique invoice ID
          const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
          const invoiceNumber = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
          
          // Calculate due date (30 days from now)
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          
          // Prepare invoice data
          const invoiceData = {
            invoiceId: invoiceId,
            orderId: order._id,
            supplier: order.supplier,
            customer: order.requester.name || 'Zoo Customer',
            amount: order.totalAmount,
            items: `${order.itemName} - ${order.quantity} tonnes`,
            status: 'Pending Verification',
            invoiceNumber: invoiceNumber,
            dueDate: dueDate,
            receivedDate: new Date()
          };
          
          // Create the invoice
          const invoice = await invoiceDAO.createInvoice(invoiceData);
          
          console.log(`Invoice ${invoiceId} created automatically for order ${order.orderId || order._id}`);
          
          res.json({
            success: true,
            message: 'Order status updated to Delivered and invoice created automatically with Pending Verification status',
            data: { 
              order,
              invoice: {
                invoiceId: invoice.invoiceId,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.amount,
                status: invoice.status
              }
            }
          });
        } catch (invoiceError) {
          console.error('Error creating automatic invoice:', invoiceError);
          // Still return success for order update, but log the invoice error
          res.json({
            success: true,
            message: 'Order status updated successfully, but invoice creation failed',
            data: { order },
            warning: 'Invoice creation failed. Please create invoice manually.'
          });
        }
      } else {
        res.json({
          success: true,
          message: 'Order status updated successfully',
          data: { order }
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order
  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Calculate totalAmount if quantity or price is being updated
      if (updateData.quantity || updateData.price) {
        // Get the current order to get existing values
        const currentOrder = await orderDAO.getOrderById(id);
        if (!currentOrder) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Use updated values or fall back to current values
        const quantity = updateData.quantity || currentOrder.quantity;
        const price = updateData.price || currentOrder.price;
        
        // Calculate new total amount
        updateData.totalAmount = quantity * price;
      }

      const order = await orderDAO.updateOrder(id, updateData);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete order
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await orderDAO.deleteOrder(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order statistics
  async getOrderStats(req, res) {
    try {
      const stats = await orderDAO.getOrderStats();
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

module.exports = new OrderController();
