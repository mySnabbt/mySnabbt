const express = require('express');
const supabase = require('../db'); // Import database utility
const router = express.Router();

// POST route to create a new order
router.post("/", async (req, res) => {
  const { customerId, items, total, status } = req.body;

  try {
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Invalid order data. Please check customerId and items.",
      });
    }

    // 1) Validate product IDs
    const productIds = items.map((i) => i.productId);
    const { data: productCheck, error: checkError } = await supabase
      .schema("pos")
      .from("products")
      .select("product_id")
      .in("product_id", productIds);

    if (checkError) throw checkError;

    if (!productCheck || productCheck.length !== productIds.length) {
      return res.status(400).json({
        error: "One or more product IDs are invalid",
      });
    }

    // 2) Insert order
    const { data: orderRow, error: orderError } = await supabase
      .schema("pos")
      .from("orders")
      .insert([
        {
          customer_id: customerId,
          total,
          status: status || "PENDING",
        },
      ])
      .select("order_id")
      .single();

    if (orderError) throw orderError;
    const orderId = orderRow.order_id;

    // 3) Insert each order item individually so we can capture order_item_id
    for (const line of items) {
      const { data: itemRow, error: itemErr } = await supabase
        .schema("pos")
        .from("order_items")
        .insert([
          {
            order_id: orderId,
            product_id: line.productId,
            quantity: line.quantity,
            price_each: line.priceEach,
          },
        ])
        .select("order_item_id")
        .single();

      if (itemErr) throw itemErr;
      const orderItemId = itemRow.order_item_id;

      // 4) Insert applied customisations for this line (if any)
      const applied = Array.isArray(line.appliedCustomisations)
        ? line.appliedCustomisations
        : [];

      if (applied.length > 0) {
        const rows = applied.map((c) => ({
          order_item_id: orderItemId,
          customisation_id: c.id || null, // may be null if it’s an ad-hoc customisation
          name: String(c.name || "").trim(), // snapshot name
          price_each: Number(c.price || 0),
        }));

        const { error: ocErr } = await supabase
          .schema("pos")
          .from("order_item_customisations")
          .insert(rows);

        if (ocErr) throw ocErr;
      }
    }

    return res.status(201).json({
      message: "Order recorded successfully!",
      orderId,
    });
  } catch (error) {
    console.error("Error recording order:", error);
    return res.status(500).json({ error: "Failed to record order" });
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

router.get("/today", async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  try {
    const { data: orders, error: ordersError } = await supabase
      .schema("pos")
      .from("orders")
      .select(`
        order_id,
        total,
        order_date,
        items:order_items (
          order_item_id,
          product_id,
          quantity,
          price_each,
          customisations:order_item_customisations (
            order_item_customisation_id,
            customisation_id,
            name,
            price_each
          )
        )
      `)
      .gte("order_date", startOfDay)
      .lte("order_date", endOfDay);

    if (ordersError) throw ordersError;

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching today’s orders:", error);
    res.status(500).json({ error: "Failed to fetch today’s orders" });
  }
});





module.exports = router;
