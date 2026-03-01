// Resource-level permission middleware
const pool = require('../config/database');

// Check if user can access a specific order
const canAccessOrder = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRole = req.user.role;

        // Admins and managers can access all orders
        if (userRole === 'admin' || userRole === 'manager') {
            return next();
        }

        // Customers can only access their own orders
        if (userRole === 'customer') {
            const [orders] = await pool.execute(
                'SELECT user_id FROM orders WHERE id = ?',
                [orderId]
            );

            if (orders.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            if (orders[0].user_id !== userId) {
                return res.status(403).json({ error: 'Access denied: You can only view your own orders' });
            }
        }

        next();
    } catch (error) {
        console.error('Error checking order permissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { canAccessOrder };


