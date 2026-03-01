// Script to generate password hash for sample data
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'password123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in database/sample_data.sql');
});


