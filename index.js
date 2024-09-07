const express = require("express");
const { body, validationResult } = require("express-validator");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use(express.json());

// CREATE: Add new product
app.post(
  "/products",
  [
    body("product_name").notEmpty().withMessage("Product name is required"),
    body("product_price")
      .notEmpty()
      .withMessage("Product price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),
    body("product_stock")
      .notEmpty()
      .withMessage("Product stock is required")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("product_rating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be between 0 and 5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      product_name,
      product_description,
      product_price,
      product_variety,
      product_rating,
      product_stock,
    } = req.body;

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
      console.log(`Success create product name: ${product_name}`);
    } catch (err) {
      res.status(500).json({ error: `Database error: ${err.message}` });
      console.log(
        `Failed create product name: ${product_name} error: ${err.message}`
      );
    }
  }
);

// READ: Get all products
app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM products");
    if (rows.length === 0) {
      return res.status(404).json({ message: "No Product" });
    }
    res.json(rows);
    console.log(`Success Get all products`);
  } catch (err) {
    console.log(`Failde Get all products error: ${err.message}`);
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
      console.log(`Get product id: ${id} not found`);
      return res
        .status(404)
        .json({ error: `Product with ID ${id} not found.` });
    }
    console.log(`Success Get product id: ${id}`);
    res.json(rows[0]);
  } catch (err) {
    console.log(`Failed Get product id: ${id} error: ${err.message}`);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// UPDATE: Update product
app.put(
  "/products/:id",
  [
    body("product_name").notEmpty().withMessage("Product name is required"),
    body("product_price")
      .notEmpty()
      .withMessage("Product price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),
    body("product_stock")
      .notEmpty()
      .withMessage("Product stock is required")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("product_rating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be between 0 and 5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      product_name,
      product_description,
      product_price,
      product_variety,
      product_rating,
      product_stock,
    } = req.body;

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
      console.log(`Success update product id: ${id}`);
      res.json({ message: "Product updated successfully" });
    } catch (err) {
      console.log(`Failed update product id: ${id} error: ${err.message}`);
      res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }
);

// DELETE: Remove product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      "DELETE FROM products WHERE product_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      console.log(`delete product id: ${id} not found`);
      return res
        .status(404)
        .json({ error: `Product with ID ${id} not found.` });
    }
    console.log(`Success delete product id: ${id}`);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.log(`Failed delete product id: ${id} error: ${err.message}`);
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
