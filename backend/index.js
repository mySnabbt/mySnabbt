const express = require('express');
const dotenv = require('dotenv');
const supabase = require('./db');
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
        const { data, error } = await supabase
            .from('pos.orders')
            .select('order_id')
            .limit(1);

        if (error) throw error;

        res.json({
            message: 'Supabase connected successfully!',
            sample_order_id: data.length > 0 ? data[0].order_id : 'No orders found',
        });
    } catch (error) {
        console.error('Error connecting to Supabase:', error);
        res.status(500).json({ error: 'Supabase connection failed' });
    }
});

app.get('/health', (req, res) => {
    res.send({ status: 'API is running' });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
