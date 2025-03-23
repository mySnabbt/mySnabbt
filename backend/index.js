const express = require('express');
const dotenv = require('dotenv');
const db = require('./db');
const ordersRouter = require('./routes/orders');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Routes
app.use('/api/orders', ordersRouter);

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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
