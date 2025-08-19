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

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

function start(port) {
  const server = app
    .listen(port, () => {
      console.log(`Server is running on port ${port}`);
      app.get('/port', (req, res) => {
        res.json({ port: server.address().port });
      });
    })
    
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        start(port + 1);
      } else {
        console.error(err);
        process.exit(1);
      }
    });
}

start(DEFAULT_PORT);
