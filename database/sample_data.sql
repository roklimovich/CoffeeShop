-- Coffee Shop Sample Data Script
-- Insert sample data for testing

USE coffeeshop;

-- Insert sample users
-- IMPORTANT: All sample users use password: password123
-- To generate a new hash, run: node scripts/generate_password_hash.js password123
INSERT INTO users (email, password_hash, role, name) VALUES
('admin@coffeeshop.com', '$2a$10$7D/DveH6w.T5fBukMYkcq.B0mdbEEmo5Y7dBo6oekzSc4ViYZbLKm', 'admin', 'Admin User'),
('manager@coffeeshop.com', '$2a$10$7D/DveH6w.T5fBukMYkcq.B0mdbEEmo5Y7dBo6oekzSc4ViYZbLKm', 'manager', 'Manager User'),
('customer1@example.com', '$2a$10$7D/DveH6w.T5fBukMYkcq.B0mdbEEmo5Y7dBo6oekzSc4ViYZbLKm', 'customer', 'John Doe'),
('customer2@example.com', '$2a$10$7D/DveH6w.T5fBukMYkcq.B0mdbEEmo5Y7dBo6oekzSc4ViYZbLKm', 'customer', 'Jane Smith');

-- Insert sample products
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('Cappuccino', 'Velvety foam with a rich espresso base', 4.50, 'Beverages', 100),
('Iced Latte', 'Chilled espresso, milk, and a touch of sweetness', 5.20, 'Beverages', 80),
('Butter Croissant', 'Flaky, buttery layers baked fresh every morning', 3.20, 'Pastries', 50),
('Flat White', 'Double shot of espresso with steamed milk', 4.80, 'Beverages', 90),
('Mocha', 'Espresso with chocolate and steamed milk', 5.10, 'Beverages', 75),
('Blueberry Muffin', 'Fresh blueberries baked into a moist muffin', 2.90, 'Pastries', 40),
('Espresso', 'Strong, concentrated coffee', 2.50, 'Beverages', 120),
('Americano', 'Espresso with hot water', 3.00, 'Beverages', 110),
('Chocolate Chip Cookie', 'Homemade cookie with chocolate chips', 2.50, 'Pastries', 60),
('Bagel with Cream Cheese', 'Fresh bagel with cream cheese spread', 3.50, 'Pastries', 45);

-- Insert sample orders
INSERT INTO orders (user_id, status, total_amount) VALUES
(3, 'completed', 12.70),
(3, 'processing', 8.40),
(4, 'pending', 7.10),
(4, 'completed', 15.30);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
-- Order 1 (customer1 - completed)
(1, 1, 2, 4.50, 9.00),  -- 2x Cappuccino
(1, 3, 1, 3.20, 3.20),  -- 1x Butter Croissant
(1, 5, 1, 5.10, 5.10),  -- 1x Mocha (subtotal should be recalculated, but showing structure)

-- Order 2 (customer1 - processing)
(2, 2, 1, 5.20, 5.20),  -- 1x Iced Latte
(2, 6, 1, 2.90, 2.90),  -- 1x Blueberry Muffin

-- Order 3 (customer2 - pending)
(3, 4, 1, 4.80, 4.80),  -- 1x Flat White
(3, 3, 1, 3.20, 3.20),  -- 1x Butter Croissant

-- Order 4 (customer2 - completed)
(4, 1, 2, 4.50, 9.00),  -- 2x Cappuccino
(4, 2, 1, 5.20, 5.20),  -- 1x Iced Latte
(4, 9, 1, 2.50, 2.50);  -- 1x Chocolate Chip Cookie

