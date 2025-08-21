// backend/index.js
require('dotenv').config();            // <-- MUST be first

const express = require('express');
const cors = require('cors');

const supabase = require('./db');      // <-- now runs after env is loaded
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');


const app = express();
//app.use(cors());
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

//
// CORS (allow preflight) – must be BEFORE routes
//
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());


app.use(express.json());

// --- Simple health & db test
app.get('/health', (_req, res) => res.json({ status: 'OK' }));
app.get('/db-test', async (_req, res) => {
  const { data, error } = await supabase.from('pos.products').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// --- API routes
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

// --- Port probe (used by the front end)
let currentPort = DEFAULT_PORT;
app.get('/port', (_req, res) => {
  res.json({ port: currentPort });
});

// --- Start (with auto-increment if port in use)
function start(port) {
  const server = app.listen(port, () => {
    currentPort = server.address().port;        // expose the bound port
    console.log(`Server is running on port ${currentPort}`);
  }).on('error', (err) => {
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