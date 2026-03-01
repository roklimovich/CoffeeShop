// Order routes
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { canAccessOrder } = require('../middleware/resourcePermissions');
const { orderValidation, orderUpdateValidation } = require('../middleware/validation');

// All order routes require authentication
router.use(authenticate);

// Get orders (filtered by user role)
router.get('/', orderController.getAllOrders);
router.get('/:id', canAccessOrder, orderController.getOrderById);
router.post('/', orderValidation, orderController.createOrder);
router.put('/:id', canAccessOrder, authorize('manager', 'admin'), orderUpdateValidation, orderController.updateOrder);
router.delete('/:id', canAccessOrder, authorize('admin'), orderController.deleteOrder);

module.exports = router;

