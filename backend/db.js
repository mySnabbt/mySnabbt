const { Pool } = require('pg');
require('dotenv').config();

// Create a pool for database connections
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Export query method for reusability
module.exports = {
    query: (text, params) => pool.query(text, params),
};
