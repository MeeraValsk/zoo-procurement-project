const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/auth');

// All routes are protected
router.use(authMiddleware);

// Supplier routes
router.post('/', supplierController.createSupplier);
router.get('/', supplierController.getAllSuppliers);
router.get('/speciality/:speciality', supplierController.getSuppliersBySpeciality);
router.get('/stats', supplierController.getSupplierStats);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplier);
router.put('/:id/rating', supplierController.updateSupplierRating);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
