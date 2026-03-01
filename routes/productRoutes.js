// Product routes
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (only authenticated users can modify)
router.post('/', authenticate, authorize('manager', 'admin'), productValidation, productController.createProduct);
router.put('/:id', authenticate, authorize('manager', 'admin'), productValidation, productController.updateProduct);
router.delete('/:id', authenticate, authorize('manager', 'admin'), productController.deleteProduct);

module.exports = router;
