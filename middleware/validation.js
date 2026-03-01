// Validation middleware
const { body } = require('express-validator');

const registerValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('role').optional().isIn(['customer', 'manager', 'admin']).withMessage('Invalid role')
];

const loginValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

const productValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
    body('description').optional().trim(),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
];

const orderValidation = [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product_id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const orderUpdateValidation = [
    body('status').isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage('Invalid order status')
];

module.exports = {
    registerValidation,
    loginValidation,
    productValidation,
    orderValidation,
    orderUpdateValidation
};


