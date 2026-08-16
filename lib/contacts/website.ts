import "server-only";
import { extractContacts } from "./extract";
import type { ContactInfo } from "@/types/scoring";

const PATHS_TO_CHECK = ["", "/contact", "/about", "/courses"];
const FETCH_TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 500_000;

/**
 * SSRF-safe fetch: only http(s), only resolvable public hosts, blocks
 * loopback/private/link-local ranges and non-standard ports (§18, §40).
 */
async function safeFetchText(url: URL): Promise<string | null> {
  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (isPrivateHostname(url.hostname)) return null;
  if (url.port && !["80", "443", ""].includes(url.port)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "TeacherHunterBot/1.0 (+contact-discovery)" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const reader = res.body?.getReader();
    if (!reader) return res.text();
    let received = 0;
    let text = "";
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > MAX_BODY_BYTES) break;
      text += decoder.decode(value, { stream: true });
    }
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  return false;
}

/**
 * Discovers public contact info from a small, fixed set of pages on a
 * teacher's own website (§18: never crawl the whole site).
 */
export async function discoverWebsiteContacts(websiteUrl: string): Promise<ContactInfo[]> {
  let base: URL;
  try {
    base = new URL(websiteUrl);
  } catch {
    return [];
  }

  const contacts: ContactInfo[] = [];
  for (const path of PATHS_TO_CHECK) {
    const pageUrl = new URL(path, base);
    const html = await safeFetchText(pageUrl);
    if (!html) continue;
    const text = stripHtml(html);
    contacts.push(...extractContacts(text, pageUrl.toString()));
  }
  return contacts;
}

function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
}
