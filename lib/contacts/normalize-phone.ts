/**
 * Normalizes Egyptian mobile numbers to E.164 (+20...). Returns null for
 * anything ambiguous rather than guessing a country code (§16).
 */
export function normalizeEgyptianPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");

  if (digits.startsWith("+20")) {
    const rest = digits.slice(3);
    return /^1\d{9}$/.test(rest) ? `+20${rest}` : null;
  }

  if (digits.startsWith("0020")) {
    const rest = digits.slice(4);
    return /^1\d{9}$/.test(rest) ? `+20${rest}` : null;
  }

  // Bare "20XXXXXXXXXX" with no + (common in wa.me links).
  if (digits.startsWith("20") && /^1\d{9}$/.test(digits.slice(2))) {
    return `+${digits}`;
  }

  // Local format: 01XXXXXXXXX (11 digits, starts with 01)
  if (/^01\d{9}$/.test(digits)) {
    return `+20${digits.slice(1)}`;
  }

  return null;
}

export function normalizeWebsiteUrl(raw: string): string | null {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
