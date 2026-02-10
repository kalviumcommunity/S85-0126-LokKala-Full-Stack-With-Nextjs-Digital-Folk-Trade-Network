import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

export function sanitizeInput(value: unknown): string {
  if (typeof value !== "string") return "";
  return sanitizeHtml(value, SANITIZE_OPTIONS).trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const clone = (Array.isArray(obj) ? [] : {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      clone[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      clone[key] = value.map((v) => (typeof v === "string" ? sanitizeInput(v) : v));
    } else if (value && typeof value === "object") {
      clone[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      clone[key] = value;
    }
  }
  return clone as T;
}

const SQLI_PATTERNS = [
  /(['"])\s*or\s*1=1/gi,
  /(['"])\s*;\s*drop\s+table/gi,
  /(['"])\s*--/g,
  /(['"])\s*#/, // MySQL style comment
];

export function detectSqlInjection(inputs: Array<string | number | boolean>): string | null {
  for (const raw of inputs) {
    const value = String(raw);
    if (SQLI_PATTERNS.some((pattern) => pattern.test(value))) {
      return value;
    }
  }
  return null;
}
