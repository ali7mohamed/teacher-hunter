import type { ContactInfo } from "@/types/scoring";

/** §22: Contact availability — 20 points, capped, no double-counting. */
export function scoreContact(contacts: ContactInfo[]): number {
  if (contacts.some((c) => c.type === "whatsapp")) return 20;
  if (contacts.some((c) => c.type === "phone")) return 15;
  if (contacts.some((c) => c.type === "email")) return 12;
  if (contacts.some((c) => c.type === "website")) return 5;
  return 0;
}
