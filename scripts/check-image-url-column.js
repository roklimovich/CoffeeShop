// Script to check if image_url column exists and add it if needed
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndAddImageUrlColumn() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'coffeeshop'
        });

        // Check if column exists
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'products' 
             AND COLUMN_NAME = 'image_url'`,
            [process.env.DB_NAME || 'coffeeshop']
        );

        if (columns.length === 0) {
            console.log('Adding image_url column to products table...');
            await connection.execute(
                `ALTER TABLE products 
                 ADD COLUMN image_url VARCHAR(500) NULL AFTER description`
            );
            console.log('✓ image_url column added successfully!');
        } else {
            console.log('✓ image_url column already exists');
        }

        // Verify the column is in the table
        const [allColumns] = await connection.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'products' 
             ORDER BY ORDINAL_POSITION`,
            [process.env.DB_NAME || 'coffeeshop']
        );

        console.log('\nProducts table columns:');
        allColumns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}, nullable: ${col.IS_NULLABLE})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAndAddImageUrlColumn();

