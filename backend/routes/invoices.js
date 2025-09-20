const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/auth');

// All routes are protected
router.use(authMiddleware);

// Invoice routes
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/supplier-invoices', invoiceController.getInvoicesBySupplier);
router.get('/status/:status', invoiceController.getInvoicesByStatus);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.put('/:id/status', invoiceController.updateInvoiceStatus);
router.put('/:id/verify', invoiceController.verifyInvoice);
router.put('/:id/discrepancy', invoiceController.addDiscrepancy);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
