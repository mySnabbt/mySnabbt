// backend/index.js
const express = require('express');
const dotenv = require('dotenv');
const supabase = require('./db');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'] // If you add auth later, include 'Authorization'
}));

app.use(express.json());

// Routes
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

// Example health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Example DB connection test
app.get('/db-test', async (req, res) => {
  const { data, error } = await supabase.from('pos.products').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
