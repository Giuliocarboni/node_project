import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const [products] = await pool.execute(
    "SELECT id, name FROM products ORDER BY id",
  );
  res.json(products);
});

export default router;
