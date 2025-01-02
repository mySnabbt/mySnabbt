const express = require('express');
const dotenv = require('dotenv');
const db = require('./db'); // Import the database utility
const ordersRouter = require('./routes/orders');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();



// Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());
app.use('/api/orders', ordersRouter);
app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000', // Only allow requests from React app
    methods: ['GET', 'POST'],        // Restrict allowed HTTP methods
    allowedHeaders: ['Content-Type'] // Allow specific headers
}));

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
app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});
