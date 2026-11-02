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

export default router;
