const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = 3000;

// Konfigurasi koneksi database MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use(bodyParser.json());

// CREATE: Add new product
app.post("/products", async (req, res) => {
  const {
    product_name,
    product_description,
    product_price,
    product_variety,
    product_rating,
    product_stock,
  } = req.body;

  // Validasi data
  if (
    product_price < 0 ||
    product_stock < 0 ||
    product_rating < 0 ||
    product_rating > 5
  ) {
    return res
      .status(400)
      .json({
        error:
          "Invalid product data: price and stock must be non-negative, rating must be between 0 and 5.",
      });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO products (product_name, product_description, product_price, product_variety, product_rating, product_stock) VALUES (?, ?, ?, ?, ?, ?)",
      [
        product_name,
        product_description,
        product_price,
        product_variety,
        product_rating,
        product_stock,
      ]
    );
    res.status(201).json({ product_id: result.insertId, ...req.body });
  } catch (err) {
    // Handling error spesifik berdasarkan kode error MySQL
    if (err.code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({
          error:
            "Duplicate entry: a product with the same name already exists.",
        });
    } else if (err.code === "ER_BAD_NULL_ERROR") {
      res.status(400).json({ error: "Bad request: missing required fields." });
    } else {
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
});

// READ: Get all products
app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// READ: Get a product by ID
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM products WHERE product_id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: `Product with ID ${id} not found.` });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// UPDATE: Update product details
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    product_description,
    product_price,
    product_variety,
    product_rating,
    product_stock,
  } = req.body;

  if (
    product_price < 0 ||
    product_stock < 0 ||
    product_rating < 0 ||
    product_rating > 5
  ) {
    return res
      .status(400)
      .json({
        error:
          "Invalid product data: price and stock must be non-negative, rating must be between 0 and 5.",
      });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE products SET product_name = ?, product_description = ?, product_price = ?, product_variety = ?, product_rating = ?, product_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?",
      [
        product_name,
        product_description,
        product_price,
        product_variety,
        product_rating,
        product_stock,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: `Product with ID ${id} not found.` });
    }
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      res.status(400).json({ error: "Bad request: invalid field values." });
    } else {
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
});

// DELETE: Remove product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      "DELETE FROM products WHERE product_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: `Product with ID ${id} not found.` });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
