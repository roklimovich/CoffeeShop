// Order controller
const { validationResult } = require('express-validator');
const pool = require('../config/database');

const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Ensure limit and offset are valid integers
        const safeLimit = Math.max(1, Math.min(100, limit)); // Limit between 1 and 100
        const safeOffset = Math.max(0, offset); // Offset must be >= 0

        let query = `
            SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at,
                   u.name as user_name, u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM orders';
        const params = [];

        // Resource-level permission: customers see only their orders
        if (userRole === 'customer') {
            query += ' WHERE o.user_id = ?';
            countQuery += ' WHERE user_id = ?';
            params.push(userId);
        }

        // Use template literals for LIMIT and OFFSET as MySQL doesn't support placeholders for these
        query += ` ORDER BY o.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

        const [orders] = await pool.execute(query, params);
        const [countResult] = await pool.execute(
            countQuery,
            userRole === 'customer' ? [userId] : []
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / safeLimit);

        res.json({
            orders,
            pagination: {
                page,
                limit: safeLimit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // Get order details
        const [orders] = await pool.execute(
            `SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at,
                    u.name as user_name, u.email as user_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        const [orderItems] = await pool.execute(
            `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal,
                    p.name as product_name, p.description as product_description
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?
             ORDER BY oi.id`,
            [orderId]
        );

        res.json({
            order: orders[0],
            items: orderItems
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { items } = req.body; // items: [{product_id, quantity}]
        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Create order
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (user_id, status, total_amount) VALUES (?, ?, ?)',
                [userId, 'pending', 0]
            );

            const orderId = orderResult.insertId;
            let totalAmount = 0;

            // Process each item
            for (const item of items) {
                const { product_id, quantity } = item;

                // Get product details
                const [products] = await connection.execute(
                    'SELECT id, price, stock_quantity FROM products WHERE id = ?',
                    [product_id]
                );

                if (products.length === 0) {
                    throw new Error(`Product with id ${product_id} not found`);
                }

                const product = products[0];

                if (product.stock_quantity < quantity) {
                    throw new Error(`Insufficient stock for product ${product_id}`);
                }

                const unitPrice = parseFloat(product.price);
                const subtotal = unitPrice * quantity;
                totalAmount += subtotal;

                // Insert order item
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [orderId, product_id, quantity, unitPrice, subtotal]
                );

                // Update product stock
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [quantity, product_id]
                );
            }

            // Update order total
            await connection.execute(
                'UPDATE orders SET total_amount = ? WHERE id = ?',
                [totalAmount, orderId]
            );

            await connection.commit();

            // Get complete order details
            const [newOrder] = await pool.execute(
                `SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at
                 FROM orders o WHERE o.id = ?`,
                [orderId]
            );

            const [orderItems] = await pool.execute(
                `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal,
                        p.name as product_name
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            res.status(201).json({
                message: 'Order created successfully',
                order: newOrder[0],
                items: orderItems
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

const updateOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        // Check if order exists
        const [existingOrders] = await pool.execute(
            'SELECT id FROM orders WHERE id = ?',
            [orderId]
        );

        if (existingOrders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        const [updatedOrder] = await pool.execute(
            `SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at
             FROM orders o WHERE o.id = ?`,
            [orderId]
        );

        res.json({
            message: 'Order updated successfully',
            order: updatedOrder[0]
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // Check if order exists
        const [existingOrders] = await pool.execute(
            'SELECT id FROM orders WHERE id = ?',
            [orderId]
        );

        if (existingOrders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await pool.execute('DELETE FROM orders WHERE id = ?', [orderId]);

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};

