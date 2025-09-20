const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// All routes are protected
router.use(authMiddleware);

// Order routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/my-orders', orderController.getOrdersByRequester);
router.get('/supplier-orders', orderController.getOrdersBySupplier);
router.get('/status/:status', orderController.getOrdersByStatus);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
