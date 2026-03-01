-- Add image_url column to products table
USE coffeeshop;

ALTER TABLE products 
ADD COLUMN image_url VARCHAR(500) NULL AFTER description;

