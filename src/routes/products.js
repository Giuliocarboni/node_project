import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const [products] = await pool.execute(
    "SELECT id, name FROM products ORDER BY id",
  );
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const [rows] = await pool.execute(
    "SELECT id, name FROM products WHERE id = ?",
    [id],
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(rows[0]);
});

router.post("/", async (req, res) => {
  const { name } = req.body ?? {};

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    name.trim().length > 255
  ) {
    return res
      .status(400)
      .json({ error: "Name is required and must be at most 255 characters" });
  }

  const cleanName = name.trim();

  const [result] = await pool.execute(
    "INSERT INTO products (name) VALUES (?)",
    [cleanName],
  );

  res.status(201).json({ id: result.insertId, name: cleanName });
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const { name } = req.body ?? {};

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    name.trim().length > 255
  ) {
    return res
      .status(400)
      .json({ error: "Name is required and must be at most 255 characters" });
  }
  const cleanName = name.trim();

  const [result] = await pool.execute(
    "UPDATE products SET name = ? WHERE id = ?",
    [cleanName, id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json({ id, name: cleanName });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [
    id,
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(204).end();
});

export default router;
