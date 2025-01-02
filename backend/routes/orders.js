const express = require('express');
const db = require('../db'); // Import database utility
const router = express.Router();

// POST route to create a new order
router.post('/', async (req, res) => {
    const { customerId, items, total, status } = req.body;

    console.log('Incoming order:', req.body);

    if (!customerId || !Array.isArray(items) || items.length === 0) {
        console.error('Validation failed: Invalid customerId or items');
        return res.status(400).json({ error: 'Invalid order data. Please check customerId and items.' });
    }

    try {
        // Validate product IDs
        const productIds = items.map(item => item.productId);
        console.log('Validating product IDs:', productIds);

        const productCheck = await db.query(
            'SELECT product_id FROM pos.products WHERE product_id = ANY($1::int[])',
            [productIds]
        );

        if (productCheck.rows.length !== productIds.length) {
            console.error('Validation failed: One or more product IDs are invalid');
            return res.status(400).json({ error: 'One or more product IDs are invalid' });
        }

        // Insert the order
        console.log('Inserting order...');
        const orderResult = await db.query(
            `INSERT INTO pos.orders (customer_id, total, status) 
             VALUES ($1, $2, $3) RETURNING order_id`,
            [customerId, total, status]
        );

        const orderId = orderResult.rows[0].order_id;
        console.log('Order inserted with ID:', orderId);

        // Insert order items
        console.log('Inserting order items...');
        const orderItemsPromises = items.map(item =>
            db.query(
                `INSERT INTO pos.order_items (order_id, product_id, quantity, price_each) 
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.productId, item.quantity, item.priceEach]
            )
        );

        await Promise.all(orderItemsPromises);
        console.log('Order items inserted successfully');

        res.status(201).json({ message: 'Order recorded successfully!', orderId });
    } catch (error) {
        console.error('Error recording order:', error);
        res.status(500).json({ error: 'Failed to record order' });
    }
});

// GET route to fetch all orders with their items
router.get('/', async (req, res) => {
    try {
        const ordersQuery = `
            SELECT 
                o.order_id, 
                o.customer_id, 
                o.order_date, 
                o.total, 
                o.status, 
                json_agg(
                    json_build_object(
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price_each', oi.price_each
                    )
                ) AS items
            FROM 
                pos.orders o
            LEFT JOIN 
                pos.order_items oi 
            ON 
                o.order_id = oi.order_id
            GROUP BY 
                o.order_id
            ORDER BY 
                o.order_date DESC;
        `;

        const result = await db.query(ordersQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


module.exports = router;
