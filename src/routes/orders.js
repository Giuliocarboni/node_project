import { Router } from "express";
import pool, { withTransaction } from "../db.js";
import { parseIdList } from "../utils/validation.js";

const router = Router();

function parseOrderBody(body) {
  const { product_ids, user_ids } = body ?? {};

  const productIds = parseIdList(product_ids);
  if (productIds === null) {
    return {
      error:
        "product_ids must be a non-empty array of unique positive integer ids",
    };
  }

  const userIds = parseIdList(user_ids);
  if (userIds === null) {
    return {
      error:
        "user_ids must be a non-empty array of unique positive integer ids",
    };
  }

  return { order: { productIds, userIds } };
}

function placeholders(count, group = "?") {
  return Array(count).fill(group).join(", ");
}

async function insertOrderLinks(connection, orderId, { productIds, userIds }) {
  await connection.execute(
    `INSERT INTO order_products (order_id, product_id) VALUES ${placeholders(productIds.length, "(?, ?)")}`,
    productIds.flatMap((productId) => [orderId, productId]),
  );

  await connection.execute(
    `INSERT INTO order_users (order_id, user_id) VALUES ${placeholders(userIds.length, "(?, ?)")}`,
    userIds.flatMap((userId) => [orderId, userId]),
  );
}

async function attachDetails(orderRows) {
  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((order) => order.id);
  const inList = placeholders(orderIds.length);

  const [productRows] = await pool.execute(
    `SELECT op.order_id, p.id, p.name
     FROM order_products op
     JOIN products p ON p.id = op.product_id
     WHERE op.order_id IN (${inList})
     ORDER BY p.id`,
    orderIds,
  );

  const [userRows] = await pool.execute(
    `SELECT ou.order_id, u.id, u.first_name, u.last_name, u.email
     FROM order_users ou
     JOIN users u ON u.id = ou.user_id
     WHERE ou.order_id IN (${inList})
     ORDER BY u.id`,
    orderIds,
  );

  const ordersById = new Map(
    orderRows.map((order) => [order.id, { ...order, products: [], users: [] }]),
  );

  for (const { order_id, ...product } of productRows) {
    ordersById.get(order_id).products.push(product);
  }

  for (const { order_id, ...user } of userRows) {
    ordersById.get(order_id).users.push(user);
  }

  return [...ordersById.values()];
}

async function findOrderById(id) {
  const [rows] = await pool.execute(
    "SELECT id, created_at FROM orders WHERE id = ?",
    [id],
  );

  const [order] = await attachDetails(rows);
  return order ?? null;
}

router.post("/", async (req, res) => {
  const { order, error } = parseOrderBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const id = await withTransaction(async (connection) => {
    const [result] = await connection.execute(
      "INSERT INTO orders () VALUES ()",
    );
    await insertOrderLinks(connection, result.insertId, order);
    return result.insertId;
  });

  const created = await findOrderById(id);

  res.status(201).location(`/orders/${id}`).json(created);
});

export default router;
