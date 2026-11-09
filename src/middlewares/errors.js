const MYSQL_ERRORS = {
  ER_DUP_ENTRY: {
    status: 409,
    message: "A resource with the same unique value already exists",
  },
  ER_ROW_IS_REFERENCED_2: {
    status: 409,
    message: "Resource is in use and cannot be deleted",
  },
  ER_NO_REFERENCED_ROW_2: {
    status: 400,
    message: "Referenced resource does not exist",
  },
};

export function notFound(req, res) {
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }

  const mapped = MYSQL_ERRORS[err.code];
  if (mapped) {
    return res.status(mapped.status).json({ error: mapped.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
