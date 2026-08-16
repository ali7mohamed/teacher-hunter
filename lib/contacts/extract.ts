import type { ContactInfo } from "@/types/scoring";
import { normalizeEgyptianPhone } from "./normalize-phone";

const WHATSAPP_RE = /https?:\/\/(?:api\.)?wa\.me\/(\+?\d{8,15})/gi;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/[^\s)"'<>]+/g;
const PHONE_RE = /(?:\+?\d[\d\s\-()]{7,16}\d)/g;

const SOCIAL_HOSTS = ["youtube.com", "youtu.be", "facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com", "wa.me", "t.me", "linktr.ee"];

/**
 * Deterministic extraction of publicly listed contact info from text
 * (channel/video descriptions). No AI call — this is exactly the kind of
 * task the credit-conservation rules say to solve with plain code (§22).
 */
export function extractContacts(text: string, sourceUrl: string): ContactInfo[] {
  const contacts: ContactInfo[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(WHATSAPP_RE)) {
    const normalized = normalizeEgyptianPhone(match[1]) ?? match[1];
    if (seen.has(`whatsapp:${normalized}`)) continue;
    seen.add(`whatsapp:${normalized}`);
    contacts.push({ type: "whatsapp", value: normalized, source: sourceUrl, confidence: "high" });
  }

  for (const match of text.matchAll(EMAIL_RE)) {
    const value = match[0].toLowerCase();
    if (seen.has(`email:${value}`)) continue;
    seen.add(`email:${value}`);
    contacts.push({ type: "email", value, source: sourceUrl, confidence: "high" });
  }

  const websiteUrl = findWebsiteUrl(text);
  if (websiteUrl && !seen.has(`website:${websiteUrl}`)) {
    seen.add(`website:${websiteUrl}`);
    contacts.push({ type: "website", value: websiteUrl, source: sourceUrl, confidence: "medium" });
  }

  // Raw phone numbers only count as medium confidence unless clearly
  // labeled (booking/contact keywords nearby) — never guessed or derived.
  const contactKeywordNearby = /(?:للحجز|للاستفسار|واتساب|رقم|contact|whatsapp|booking|call)/i.test(text);
  if (contactKeywordNearby) {
    for (const match of text.matchAll(PHONE_RE)) {
      const normalized = normalizeEgyptianPhone(match[0]);
      if (!normalized) continue;
      if (seen.has(`phone:${normalized}`)) continue;
      seen.add(`phone:${normalized}`);
      contacts.push({ type: "phone", value: normalized, source: sourceUrl, confidence: "medium" });
    }
  }

  return contacts;
}

function findWebsiteUrl(text: string): string | null {
  const urls = text.match(URL_RE) ?? [];
  for (const raw of urls) {
    try {
      const url = new URL(raw.replace(/[.,;)]+$/, ""));
      if (SOCIAL_HOSTS.some((h) => url.hostname.includes(h))) continue;
      return url.toString();
    } catch {
      continue;
    }
  }
  return null;
}

/** Picks the single best contact per priority order (§14: WhatsApp > phone > email > website). */
export function pickPrimaryContact(contacts: ContactInfo[]): ContactInfo | null {
  const priority: ContactInfo["type"][] = ["whatsapp", "phone", "email", "website"];
  for (const type of priority) {
    const found = contacts.find((c) => c.type === type);
    if (found) return found;
  }
  return null;
}
