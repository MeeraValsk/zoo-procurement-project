const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Admin routes
router.get('/users', authMiddleware, authController.getAllUsers);
router.get('/users/role/:role', authMiddleware, authController.getUsersByRole);
router.put('/users/:userId', authMiddleware, authController.updateUser);
router.delete('/users/:userId', authMiddleware, authController.deleteUser);

// Supplier routes (using User table)
router.get('/suppliers', authMiddleware, authController.getSuppliers);
router.get('/suppliers/speciality/:speciality', authMiddleware, authController.getSuppliersBySpeciality);

module.exports = router;
