const express = require('express');
const router = express.Router();
const supabase = require('../db');

router.get('/', async (req, res) => {
  try {
    const { data: products, error: pErr } = await supabase
      .schema('pos')
      .from('products')
      .select('product_id, product_name, price, category_id, is_active')
      .eq('is_active', true)
      .order('product_name', { ascending: true });
    if (pErr) throw pErr;

    const { data: categories, error: cErr } = await supabase
      .schema('pos')
      .from('categories')
      .select('category_id, category_name');
    if (cErr) throw cErr;

    const catById = new Map((categories || []).map(c => [c.category_id, c.category_name]));

    const items = (products || []).map(p => ({
      id: p.product_id,
      name: p.product_name,
      price: Number(p.price),
      categoryId: p.category_id,
      categoryName: catById.get(p.category_id) || null,
      customisations: []
    }));

    res.json({ items });
  } catch (err) {
    console.error('GET /api/products failed:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

module.exports = router;
