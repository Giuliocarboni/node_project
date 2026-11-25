const ID_PATTERN = /^[1-9]\d*$/;
const MAX_UNSIGNED_INT = 2 ** 32 - 1;

export function parseId(value) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    return null;
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    return null;
  }
  return id;
}

export function parseRequiredString(value, maxLength = 255) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.length > maxLength) {
    return null;
  }
  return trimmed;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmail(value) {
  const email = parseRequiredString(value);
  if (email === null || !EMAIL_PATTERN.test(email)) {
    return null;
  }
  return email.toLowerCase();
}

export function parseIdList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const allValid = value.every(
    (id) => Number.isInteger(id) && id > 0 && id <= MAX_UNSIGNED_INT,
  );
  if (!allValid) {
    return null;
  }

  if (new Set(value).size !== value.length) {
    return null;
  }

  return value;
}
