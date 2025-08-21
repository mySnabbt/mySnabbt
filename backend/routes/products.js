const express = require("express");
const router = express.Router();
const supabase = require("../db");

/*
Shape sent to the frontend:
{
  id, name, price, categoryId, categoryName,
  customisations: [{ id, name, price }],
  contaminants: [{ id, name }]
}
*/

// Get all products
router.get("/", async (_req, res) => {
  try {
    // products + category names
    const { data: products, error: pErr } = await supabase
      .schema("pos")
      .from("products")
      .select("product_id, product_name, price, category_id, is_active")
      .eq("is_active", true)
      .order("product_name", { ascending: true });

    if (pErr) throw pErr;
    if (!products || products.length === 0) {
      return res.json({ items: [] });
    }

    // categories
    const { data: categories, error: cErr } = await supabase
      .schema("pos")
      .from("categories")
      .select("category_id, category_name");

    if (cErr) throw cErr;

    const catById = new Map(
      (categories || []).map((c) => [c.category_id, c.category_name])
    );

    const ids = products.map((p) => p.product_id);

    // customisations
    const { data: custs, error: cuErr } = await supabase
      .schema("pos")
      .from("product_customisations")
      .select("customisation_id, product_id, name, price")
      .in("product_id", ids);

    if (cuErr) throw cuErr;

    // contaminants
    const { data: contams, error: tErr } = await supabase
      .schema("pos")
      .from("product_contaminants")
      .select("contaminant_id, product_id, name")
      .in("product_id", ids);

    if (tErr) throw tErr;

    // shape
    const byId = new Map(
      products.map((p) => [
        p.product_id,
        {
          id: p.product_id,
          name: p.product_name,
          price: Number(p.price),
          categoryId: p.category_id,
          categoryName: catById.get(p.category_id) || null,
          customisations: [],
          contaminants: [],
        },
      ])
    );

    (custs || []).forEach((c) => {
      byId.get(c.product_id)?.customisations.push({
        id: c.customisation_id,
        name: c.name,
        price: Number(c.price),
      });
    });

    (contams || []).forEach((t) => {
      byId.get(t.product_id)?.contaminants.push({
        id: t.contaminant_id,
        name: t.name,
      });
    });

    res.json({ items: Array.from(byId.values()) });
  } catch (err) {
    console.error("GET /api/products failed:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const { name, price, categoryName, sku } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    // ensure category
    let categoryId = null;
    if (categoryName) {
      const { data: cat, error: catErr } = await supabase
        .schema("pos")
        .from("categories")
        .upsert({ category_name: categoryName }, { onConflict: "category_name" })
        .select("category_id, category_name")
        .single();

      if (catErr) throw catErr;
      categoryId = cat.category_id;
    }

    const generatedSku =
      (sku || name).replace(/[^A-Za-z0-9]+/g, "-").slice(0, 24).toUpperCase() +
      "-" +
      Date.now().toString().slice(-5);

    const { data: created, error: insErr } = await supabase
      .schema("pos")
      .from("products")
      .insert([
        {
          product_name: name,
          sku: generatedSku,
          category_id: categoryId,
          price: Number(price || 0),
          stock: 0,
          is_active: true,
        },
      ])
      .select("product_id, product_name, price, category_id")
      .single();

    if (insErr) throw insErr;

    let catName = null;
    if (categoryId) {
      const { data: catRow } = await supabase
        .schema("pos")
        .from("categories")
        .select("category_name")
        .eq("category_id", categoryId)
        .single();

      catName = catRow?.category_name || null;
    }

    res.status(201).json({
      id: created.product_id,
      name: created.product_name,
      price: Number(created.price),
      categoryId: created.category_id,
      categoryName: catName,
      customisations: [],
      contaminants: [],
    });
  } catch (err) {
    console.error("POST /api/products failed:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Add or upsert a customisation
router.post("/:productId/customisations", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { name, price } = req.body;
    if (!productId || !name) return res.status(400).json({ error: "bad request" });

    const { data: up, error: upErr } = await supabase
      .schema("pos")
      .from("product_customisations")
      .upsert(
        { product_id: productId, name, price: Number(price || 0) },
        { onConflict: "product_id,name" }
      )
      .select("customisation_id, product_id, name, price")
      .single();

    if (upErr) throw upErr;

    res.status(201).json({
      id: up.customisation_id,
      productId: up.product_id,
      name: up.name,
      price: Number(up.price),
    });
  } catch (err) {
    if (err.code === "23503")
      return res.status(404).json({ error: "product not found" });
    console.error("POST /customisations failed:", err);
    res.status(500).json({ error: "Failed to add customisation" });
  }
});

// Edit a customisation
router.patch("/:productId/customisations/:id", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const id = Number(req.params.id);
    const { name, price } = req.body;

    const { data: row, error: updErr } = await supabase
      .schema("pos")
      .from("product_customisations")
      .update({
        name,
        price: price != null ? Number(price) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("customisation_id", id)
      .eq("product_id", productId)
      .select("customisation_id, product_id, name, price")
      .single();

    if (updErr) throw updErr;
    if (!row) return res.status(404).json({ error: "not found" });

    res.json({
      id: row.customisation_id,
      productId: row.product_id,
      name: row.name,
      price: Number(row.price),
    });
  } catch (err) {
    console.error("PATCH /customisations failed:", err);
    res.status(500).json({ error: "Failed to update customisation" });
  }
});

// Delete a customisation
router.delete("/:productId/customisations/:id", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const id = Number(req.params.id);

    const { error: delErr, count } = await supabase
      .schema("pos")
      .from("product_customisations")
      .delete({ count: "exact" })
      .eq("customisation_id", id)
      .eq("product_id", productId);

    if (delErr) throw delErr;
    if (!count) return res.status(404).json({ error: "not found" });

    res.status(204).end();
  } catch (err) {
    console.error("DELETE /customisations failed:", err);
    res.status(500).json({ error: "Failed to delete customisation" });
  }
});

// Add a contaminant
router.post("/:productId/contaminants", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { name } = req.body;
    if (!productId || !name) return res.status(400).json({ error: "bad request" });

    const { data: up, error: upErr } = await supabase
      .schema("pos")
      .from("product_contaminants")
      .upsert({ product_id: productId, name }, { onConflict: "product_id,name" })
      .select("contaminant_id, product_id, name")
      .single();

    if (upErr) throw upErr;

    res.status(201).json({
      id: up.contaminant_id,
      productId: up.product_id,
      name: up.name,
    });
  } catch (err) {
    console.error("POST /contaminants failed:", err);
    res.status(500).json({ error: "Failed to add contaminant" });
  }
});

// Edit a contaminant
router.patch("/:productId/contaminants/:id", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const id = Number(req.params.id);
    const { name } = req.body;

    const { data: row, error: updErr } = await supabase
      .schema("pos")
      .from("product_contaminants")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("contaminant_id", id)
      .eq("product_id", productId)
      .select("contaminant_id, product_id, name")
      .single();

    if (updErr) throw updErr;
    if (!row) return res.status(404).json({ error: "not found" });

    res.json({
      id: row.contaminant_id,
      productId: row.product_id,
      name: row.name,
    });
  } catch (err) {
    console.error("PATCH /contaminants failed:", err);
    res.status(500).json({ error: "Failed to update contaminant" });
  }
});

// Delete a contaminant
router.delete("/:productId/contaminants/:id", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const id = Number(req.params.id);

    const { error: delErr, count } = await supabase
      .schema("pos")
      .from("product_contaminants")
      .delete({ count: "exact" })
      .eq("contaminant_id", id)
      .eq("product_id", productId);

    if (delErr) throw delErr;
    if (!count) return res.status(404).json({ error: "not found" });

    res.status(204).end();
  } catch (err) {
    console.error("DELETE /contaminants failed:", err);
    res.status(500).json({ error: "Failed to delete contaminant" });
  }
});

module.exports = router;
