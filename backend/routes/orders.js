const express = require('express');
const supabase = require('../db'); // Import database utility
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

        const { data: productCheck, error: checkError } = await supabase
            .schema("pos")
            .from('products')
            .select('product_id')
            .in('product_id', productIds);

        if (checkError) throw checkError;

        if (productCheck.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more product IDs are invalid' });
        }

        // Insert the order
        const { data: orderData, error: orderError } = await supabase
            .schema("pos")
            .from('orders')
            .insert([{ customer_id: customerId, total, status }])
            .select('order_id')
            .single();

        if (orderError) throw orderError;

        const orderId = orderData.order_id;

        console.log('Order inserted with ID:', orderId);

        // Insert order items
        console.log('Inserting order items...');
        const orderItems = items.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price_each: item.priceEach,
        }));

        const { error: itemsError } = await supabase
            .schema("pos")
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error inserting order items:', itemsError);
            return res.status(500).json({ error: 'Failed to record order items' });
        }

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
        const { data: orders, error: ordersError } = await supabase
            .schema("pos")
            .from('orders')
            .select('order_id, customer_id, order_date, total, status');

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        const { data: items, error: itemsError } = await supabase
            .schema("pos")
            .from('order_items')
            .select('order_id, product_id, quantity, price_each');

        if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return res.status(500).json({ error: 'Failed to fetch order items' });
        }

        const ordersWithItems = orders.map(order => ({
            ...order,
            items: items.filter(i => i.order_id === order.order_id)
        }));

        res.status(200).json(ordersWithItems);
    } catch (error) {
        console.error('Unexpected error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

router.get('/today', async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    try {
        const { data: orders, error: ordersError } = await supabase
            .schema('pos')
            .from('orders')
            .select(`
                order_id,
                total,
                order_date,
                items:order_items (
                    product_id,
                    quantity,
                    price_each
                )
            `)
            .gte('order_date', startOfDay)
            .lte('order_date', endOfDay);

        if (ordersError) throw ordersError;

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching today’s orders:', error);
        res.status(500).json({ error: 'Failed to fetch today’s orders' });
    }
});




module.exports = router;
