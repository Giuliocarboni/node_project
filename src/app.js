import express from "express";
import pool from "./db.js";
import productsRouter from "./routes/products.js";
import usersRouter from "./routes/users.js";
import { notFound, errorHandler } from "./middlewares/errors.js";

const app = express();
app.use(express.json());
app.use("/products", productsRouter);
app.use("/users", usersRouter);

app.get("/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "ok", database: "up" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: "error", database: "down" });
  }
});

app.use(notFound);
app.use(errorHandler);

export default app;
