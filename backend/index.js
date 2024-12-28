const express = require('express');
const dotenv = require('dotenv');
const db = require('./db'); // Import the database utility

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Test Route to Check Database Connection
app.get('/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() AS current_time');
        res.json({
            message: 'Database connected successfully!',
            current_time: result.rows[0].current_time,
        });
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
