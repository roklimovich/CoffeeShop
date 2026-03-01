// Product controller
const { validationResult } = require('express-validator');
const pool = require('../config/database');

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const category = req.query.category;

        // Ensure limit and offset are valid integers
        const safeLimit = Math.max(1, Math.min(100, limit)); // Limit between 1 and 100
        const safeOffset = Math.max(0, offset); // Offset must be >= 0

        // Check if image_url column exists, if not, select without it
        let query = 'SELECT id, name, description, price, category, stock_quantity, created_at FROM products';
        try {
            // Try to include image_url if column exists
            const [testColumns] = await pool.execute(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'products' 
                 AND COLUMN_NAME = 'image_url'`
            );
            if (testColumns.length > 0) {
                query = 'SELECT id, name, description, price, category, stock_quantity, image_url, created_at FROM products';
            }
        } catch (err) {
            // If check fails, use query without image_url
            console.log('image_url column not found, using query without it');
        }
        let countQuery = 'SELECT COUNT(*) as total FROM products';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            countQuery += ' WHERE category = ?';
            params.push(category);
        }

        // Use template literals for LIMIT and OFFSET as MySQL doesn't support placeholders for these
        query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

        const [products] = await pool.execute(query, params);
        const [countResult] = await pool.execute(countQuery, category ? [category] : []);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / safeLimit);

        res.json({
            products,
            pagination: {
                page,
                limit: safeLimit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Check if image_url column exists
        let productQuery = 'SELECT id, name, description, price, category, stock_quantity, created_at FROM products WHERE id = ?';
        try {
            const [testColumns] = await pool.execute(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'products' 
                 AND COLUMN_NAME = 'image_url'`
            );
            if (testColumns.length > 0) {
                productQuery = 'SELECT id, name, description, price, category, stock_quantity, image_url, created_at FROM products WHERE id = ?';
            }
        } catch (err) {
            // Use query without image_url
        }
        
        const [products] = await pool.execute(productQuery, [productId]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product: products[0] });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, price, category, stock_quantity, image_url } = req.body;

        // Check if image_url column exists
        let insertQuery = 'INSERT INTO products (name, description, price, category, stock_quantity) VALUES (?, ?, ?, ?, ?)';
        let insertParams = [name, description, parseFloat(price), category, parseInt(stock_quantity)];
        let selectQuery = 'SELECT id, name, description, price, category, stock_quantity, created_at FROM products WHERE id = ?';
        
        try {
            const [testColumns] = await pool.execute(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'products' 
                 AND COLUMN_NAME = 'image_url'`
            );
            if (testColumns.length > 0) {
                insertQuery = 'INSERT INTO products (name, description, price, category, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)';
                insertParams.push(image_url || null);
                selectQuery = 'SELECT id, name, description, price, category, stock_quantity, image_url, created_at FROM products WHERE id = ?';
            }
        } catch (err) {
            // Use queries without image_url
        }

        const [result] = await pool.execute(insertQuery, insertParams);
        const [newProduct] = await pool.execute(selectQuery, [result.insertId]);

        res.status(201).json({
            message: 'Product created successfully',
            product: newProduct[0]
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const productId = parseInt(req.params.id);
        const { name, description, price, category, stock_quantity, image_url } = req.body;

        // Check if product exists
        const [existingProducts] = await pool.execute(
            'SELECT id FROM products WHERE id = ?',
            [productId]
        );

        if (existingProducts.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if image_url column exists
        let updateQuery = 'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock_quantity = ? WHERE id = ?';
        let updateParams = [name, description, parseFloat(price), category, parseInt(stock_quantity), productId];
        let selectQuery = 'SELECT id, name, description, price, category, stock_quantity, created_at FROM products WHERE id = ?';
        
        try {
            const [testColumns] = await pool.execute(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'products' 
                 AND COLUMN_NAME = 'image_url'`
            );
            if (testColumns.length > 0) {
                updateQuery = 'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock_quantity = ?, image_url = ? WHERE id = ?';
                updateParams = [name, description, parseFloat(price), category, parseInt(stock_quantity), image_url || null, productId];
                selectQuery = 'SELECT id, name, description, price, category, stock_quantity, image_url, created_at FROM products WHERE id = ?';
            }
        } catch (err) {
            // Use queries without image_url
        }

        await pool.execute(updateQuery, updateParams);
        const [updatedProduct] = await pool.execute(selectQuery, [productId]);

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct[0]
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Check if product exists
        const [existingProducts] = await pool.execute(
            'SELECT id FROM products WHERE id = ?',
            [productId]
        );

        if (existingProducts.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await pool.execute('DELETE FROM products WHERE id = ?', [productId]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
