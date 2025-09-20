const express = require('express');
const router = express.Router();
const feedTypeController = require('../controllers/feedTypeController');
const authMiddleware = require('../middleware/auth');

// All routes are protected
router.use(authMiddleware);

// Feed type routes
router.post('/', feedTypeController.createFeedType);
router.get('/', feedTypeController.getAllFeedTypes);
router.get('/category/:category', feedTypeController.getFeedTypesByCategory);
router.get('/stats', feedTypeController.getFeedTypeStats);
router.get('/:id', feedTypeController.getFeedTypeById);
router.put('/:id', feedTypeController.updateFeedType);
router.delete('/:id', feedTypeController.deleteFeedType);

module.exports = router;
