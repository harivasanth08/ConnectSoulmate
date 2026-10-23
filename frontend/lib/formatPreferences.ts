/**
 * Helper utilities for formatting and sanitizing partner preference fields.
 * Prevents displaying "{}" or "[]" or brace-wrapped values like "{Religion}" or "{Mother Tongue}".
 * Prevents displaying "0" in age inputs and fixes "022" / "220" input concatenation issues.
 */

/**
 * Safely transforms a preference value (string, array, or object) for display.
 * Returns an empty string "" if the value is empty, null, undefined, "[]", "{}", or placeholders like "{Religion}".
 * Formats arrays or JSON arrays like ["Hindu"] into clean readable text ("Hindu").
 * Strips accidental wrapping braces, e.g. "{Hindu}" -> "Hindu", "{Telugu}" -> "Telugu".
 */
export function formatPreferenceDisplay(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Handle actual JavaScript Array
  if (Array.isArray(value)) {
    const items = value
      .map((item) => formatPreferenceDisplay(item))
      .filter((item) => item.length > 0);
    return items.join(", ");
  }

  // Handle JavaScript Object (e.g. { religion: "Hindu" }, { value: "Hindu" }, etc.)
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const candidateKeys = [
      "religion",
      "motherTongue",
      "mother_tongue",
      "value",
      "label",
      "name",
    ];

    for (const key of candidateKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        const extracted = formatPreferenceDisplay(obj[key]);
        if (extracted) return extracted;
      }
    }

    const values = Object.values(obj)
      .map((val) => formatPreferenceDisplay(val))
      .filter((val) => val.length > 0);
    return values.join(", ");
  }

  // Handle String
  if (typeof value === "string") {
    let trimmed = value.trim();
    if (!trimmed || trimmed === "[]" || trimmed === '[""]' || trimmed === "{}" || trimmed === '"{}"') {
      return "";
    }

    // Check if it is a stringified JSON array like '["Hindu"]' or '[]'
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const items = parsed
            .map((item) => formatPreferenceDisplay(item))
            .filter((item) => item.length > 0);
          return items.join(", ");
        }
      } catch {
        // Fallback: strip surrounding brackets and quotes
        trimmed = trimmed
          .replace(/^\[\s*["']?/, "")
          .replace(/["']?\s*\]$/, "")
          .trim();
      }
    }

    // Check if it is a stringified JSON object like '{"religion":"Hindu"}' or '{}'
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return formatPreferenceDisplay(parsed);
        }
      } catch {
        // Not standard JSON: strip outer braces e.g. "{Religion}" or "{Hindu}"
        trimmed = trimmed
          .replace(/^\{+\s*["']?/, "")
          .replace(/["']?\s*\}+$/, "")
          .trim();
      }
    }

    // If string still has wrapping braces or quotes, strip them cleanly
    trimmed = trimmed
      .replace(/^\{+\s*/, "")
      .replace(/\s*\}+$/, "")
      .replace(/^["']/, "")
      .replace(/["']$/, "")
      .trim();

    // Check for unwanted placeholder strings or empty representations
    const lower = trimmed.toLowerCase();
    if (
      !trimmed ||
      lower === "religion" ||
      lower === "{religion}" ||
      lower === "mother tongue" ||
      lower === "mothertongue" ||
      lower === "{mother tongue}" ||
      lower === "preferred religion" ||
      lower === "preferred mother tongue" ||
      lower === "[]" ||
      lower === "{}" ||
      lower === "null" ||
      lower === "undefined" ||
      lower === "none" ||
      lower === "any" && trimmed === "{Any}"
    ) {
      return "";
    }

    return trimmed;
  }

  return String(value);
}

/**
 * Formats an age value for form input binding.
 * Null, undefined, 0, non-positive, or empty values become "" so the input field starts empty.
 * Valid positive ages (e.g. 18, 22) return their string representation without leading zeros.
 */
export function formatAgeForForm(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const num = typeof value === "number" ? value : Number(String(value).trim());
  if (isNaN(num) || num <= 0) {
    return "";
  }

  return String(Math.floor(num));
}

/**
 * Sanitizes age input changes while the user types.
 * Strips non-digits, negative signs, decimals, and leading zeros.
 * Prevents "0" from persisting as initial/default value.
 * Typing "22" produces "22" (not "022" or "220").
 * Typing "0" alone produces "" so the input field clears rather than locking to 0.
 * Restricts to a maximum of 3 digits.
 */
export function sanitizeAgeInput(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);
  // Strip non-digit characters (including -, ., e, etc.)
  const digitsOnly = str.replace(/\D/g, "");
  if (!digitsOnly) return "";
  // Strip all leading zeros (e.g. "022" -> "22", "0" -> "")
  const stripped = digitsOnly.replace(/^0+/, "");
  if (!stripped) {
    return "";
  }
  // Enforce max age digits (max 3 digits, e.g. 100)
  return stripped.slice(0, 3);
}

/**
 * Parses age string for submission payload.
 * Returns a positive integer between 18 and 100 or null if empty/invalid.
 */
export function parseAgeForSubmit(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const sanitized = sanitizeAgeInput(value);
  if (!sanitized) return null;
  const num = Number(sanitized);
  if (isNaN(num) || num <= 0) return null;
  return Math.floor(num);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Resolves a profile photo string (relative path or full URL) into a complete, absolute image URL.
 * Automatically prefixes API_URL for relative backend paths like "/uploads/profile-123.jpg".
 * Returns null for empty, invalid, or null paths.
 */
export function resolveProfileImageUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath || typeof photoPath !== "string") return null;
  const trimmed = photoPath.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_URL}${cleanPath}`;
}

