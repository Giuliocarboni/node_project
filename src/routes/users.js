import { Router } from "express";
import pool from "../db.js";
import {
  parseId,
  parseRequiredString,
  parseEmail,
} from "../utils/validation.js";

const router = Router();

function parseUserBody(body) {
  const { first_name, last_name, email } = body ?? {};

  const firstName = parseRequiredString(first_name);
  if (firstName === null) {
    return {
      error: "first_name is required and must be at most 255 characters",
    };
  }

  const lastName = parseRequiredString(last_name);
  if (lastName === null) {
    return {
      error: "last_name is required and must be at most 255 characters",
    };
  }

  const cleanEmail = parseEmail(email);
  if (cleanEmail === null) {
    return { error: "email is required and must be a valid email address" };
  }

  return {
    user: { first_name: firstName, last_name: lastName, email: cleanEmail },
  };
}

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

router.post("/", async (req, res) => {
  const { user, error } = parseUserBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const [result] = await pool.execute(
    "INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)",
    [user.first_name, user.last_name, user.email],
  );

  res.status(201).json({ id: result.insertId, ...user });
});

export default router;
