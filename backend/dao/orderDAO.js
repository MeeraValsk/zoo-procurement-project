const Order = require('../models/Order');

class OrderDAO {
  // Create a new order
  async createOrder(orderData) {
    try {
      const order = new Order(orderData);
      return await order.save();
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Get all orders
  async getAllOrders() {
    try {
      return await Order.find()
        .populate('requester', 'name email role')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting orders: ${error.message}`);
    }
  }

  // Get order by ID
  async getOrderById(id) {
    try {
      return await Order.findById(id)
        .populate('requester', 'name email role')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('approvedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error getting order by ID: ${error.message}`);
    }
  }

  // Get orders by requester
  async getOrdersByRequester(requesterId) {
    try {
      return await Order.find({ requester: requesterId })
        .populate('supplier', 'name email speciality contact address rating')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting orders by requester: ${error.message}`);
    }
  }

  // Get orders by supplier
  async getOrdersBySupplier(supplierId) {
    try {
      return await Order.find({ supplier: supplierId })
        .populate('requester', 'name email role')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting orders by supplier: ${error.message}`);
    }
  }

  // Get orders by status
  async getOrdersByStatus(status) {
    try {
      return await Order.find({ status })
        .populate('requester', 'name email role')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting orders by status: ${error.message}`);
    }
  }

  // Update order status
  async updateOrderStatus(id, status, approvedBy = null) {
    try {
      const updateData = { status };
      if (approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedDate = new Date();
      }
      return await Order.findByIdAndUpdate(id, updateData, { new: true })
        .populate('requester', 'name email role')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('approvedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Update order
  async updateOrder(id, updateData) {
    try {
      return await Order.findByIdAndUpdate(id, updateData, { new: true })
        .populate('requester', 'name email role')
        .populate('supplier', 'name email speciality contact address rating')
        .populate('approvedBy', 'name email role');
    } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
  }

  // Delete order
  async deleteOrder(id) {
    try {
      return await Order.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting order: ${error.message}`);
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);
      return stats;
    } catch (error) {
      throw new Error(`Error getting order stats: ${error.message}`);
    }
  }
}

module.exports = new OrderDAO();
