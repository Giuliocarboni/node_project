import { Router } from "express";
import pool from "../db.js";
import { parseId } from "../utils/validation.js";

const router = Router();

router.get("/", async (req, res) => {
  const [users] = await pool.execute(
    "SELECT id, first_name, last_name, email FROM users ORDER BY id",
  );
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  const [rows] = await pool.execute(
    "SELECT id, first_name, last_name, email FROM users WHERE id = ?",
    [id],
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(rows[0]);
});

export default router;