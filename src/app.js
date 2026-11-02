import express from "express";
import pool from "./db.js";
import productsRouter from "./routes/products.js";

const app = express();
app.use(express.json());
app.use("/products", productsRouter);

app.get("/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "ok", database: "up" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: "error", database: "down" });
  }
});

export default app;
