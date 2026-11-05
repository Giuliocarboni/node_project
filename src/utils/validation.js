const ID_PATTERN = /^[1-9]\d*$/;

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
