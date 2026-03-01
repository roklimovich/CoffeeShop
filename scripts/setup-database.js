// Node.js script to setup database
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        // Connect without database first to create it
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        const dbName = process.env.DB_NAME || 'coffeeshop';
        
        // First, explicitly create the database
        try {
            await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log(`Database '${dbName}' created or already exists`);
        } catch (err) {
            if (!err.message.includes('already exists')) {
                throw err;
            }
        }
        
        // Switch to the database
        await connection.query(`USE ${dbName}`);
        console.log(`Using database '${dbName}'`);
        
        // Remove comments and split by semicolons
        let cleanedSQL = schemaSQL
            .split('\n')
            .filter(line => !line.trim().startsWith('--')) // Remove comment lines
            .join('\n');
        
        // Split by semicolons and filter
        const statements = cleanedSQL
            .split(';')
            .map(s => s.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ')) // Normalize whitespace
            .filter(s => {
                const lower = s.toLowerCase();
                return s.length > 0 && 
                       !lower.startsWith('create database') &&
                       !lower.startsWith('use ');
            });

        console.log(`Executing ${statements.length} SQL statements...`);
        
        // Execute each CREATE TABLE statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await connection.query(statement);
                    // Log which table was created
                    const tableMatch = statement.match(/CREATE\s+TABLE.*?(\w+)/i);
                    if (tableMatch) {
                        console.log(`  ✓ Created table: ${tableMatch[1]}`);
                    }
                } catch (err) {
                    // Ignore "table exists" errors
                    if (err.message.includes('already exists')) {
                        const tableMatch = statement.match(/CREATE\s+TABLE.*?(\w+)/i);
                        if (tableMatch) {
                            console.log(`  ⊙ Table already exists: ${tableMatch[1]}`);
                        }
                    } else {
                        console.error(`  ✗ Error executing statement ${i + 1}:`, err.message);
                        console.error('  Statement:', statement.substring(0, 200));
                        throw err; // Re-throw to stop execution
                    }
                }
            }
        }

        // Verify tables were created
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n✅ Database schema created successfully!`);
        console.log(`   Created ${tables.length} tables:`, tables.map(t => Object.values(t)[0]).join(', '));

        // We're already connected to the database, no need to reconnect
        // Just verify we're using the right database
        const [dbCheck] = await connection.query('SELECT DATABASE() as current_db');
        console.log(`Current database: ${dbCheck[0].current_db}`);

        // Read and execute sample_data.sql
        const sampleDataPath = path.join(__dirname, '..', 'database', 'sample_data.sql');
        let sampleDataSQL = fs.readFileSync(sampleDataPath, 'utf8');
        
        // Remove comment lines and USE statement
        sampleDataSQL = sampleDataSQL
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
            .join('\n')
            .replace(/USE\s+\w+\s*;/gi, '');
        
        // Remove inline comments (-- comments at end of lines)
        sampleDataSQL = sampleDataSQL.replace(/--.*$/gm, '');
        
        // Split by semicolons and clean up
        const dataStatements = sampleDataSQL
            .split(';')
            .map(s => s.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '))
            .filter(s => {
                const upper = s.toUpperCase();
                return s.length > 0 && 
                       (upper.startsWith('INSERT') || 
                        upper.startsWith('UPDATE') || 
                        upper.startsWith('DELETE'));
            });

        console.log(`Loading sample data (${dataStatements.length} statements)...`);
        let successCount = 0;
        for (let i = 0; i < dataStatements.length; i++) {
            const statement = dataStatements[i];
            if (statement) {
                try {
                    await connection.query(statement);
                    successCount++;
                    // Log progress for large inserts
                    if (statement.toUpperCase().startsWith('INSERT')) {
                        const tableMatch = statement.match(/INTO\s+(\w+)/i);
                        if (tableMatch) {
                            console.log(`  ✓ Inserted into ${tableMatch[1]}`);
                        }
                    }
                } catch (err) {
                    // Ignore duplicate key errors
                    if (err.message.includes('Duplicate entry')) {
                        console.log(`  ⊙ Skipped duplicate entry`);
                    } else {
                        console.error(`  ✗ Error executing statement ${i + 1}:`, err.message);
                        console.error('  Statement:', statement.substring(0, 100) + '...');
                    }
                }
            }
        }
        
        console.log(`\n✅ Sample data loaded! (${successCount}/${dataStatements.length} statements executed)`);

        console.log('✅ Sample data loaded successfully!');
        console.log('\n🎉 Database setup complete!');
        console.log('\nYou can now start the server with: npm start');

    } catch (error) {
        console.error('❌ Error setting up database:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('\nMake sure:');
        console.error('1. MySQL is running');
        console.error('2. .env file has correct database credentials');
        console.error('3. MySQL user has permission to create databases');
        console.error('\nCurrent .env settings:');
        console.error('  DB_HOST:', process.env.DB_HOST || 'localhost');
        console.error('  DB_USER:', process.env.DB_USER || 'root');
        console.error('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();

