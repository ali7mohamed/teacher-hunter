import { describe, it, expect } from "vitest";
import { extractContacts, pickPrimaryContact } from "@/lib/contacts/extract";
import { normalizeEgyptianPhone } from "@/lib/contacts/normalize-phone";

describe("normalizeEgyptianPhone", () => {
  it("normalizes local format to E.164", () => {
    expect(normalizeEgyptianPhone("01012345678")).toBe("+201012345678");
  });
  it("passes through already-normalized numbers", () => {
    expect(normalizeEgyptianPhone("+201012345678")).toBe("+201012345678");
  });
  it("returns null for ambiguous numbers rather than guessing", () => {
    expect(normalizeEgyptianPhone("12345")).toBeNull();
    expect(normalizeEgyptianPhone("+1 415 555 0100")).toBeNull();
  });
});

describe("extractContacts", () => {
  it("finds a wa.me link as high-confidence whatsapp", () => {
    const contacts = extractContacts("للحجز والاستفسار: https://wa.me/201012345678", "https://youtube.com/x");
    expect(contacts.find((c) => c.type === "whatsapp")).toMatchObject({ value: "+201012345678", confidence: "high" });
  });

  it("finds an email", () => {
    const contacts = extractContacts("Contact: teacher@example.com", "src");
    expect(contacts.find((c) => c.type === "email")?.value).toBe("teacher@example.com");
  });

  it("does not extract a phone number without contact context", () => {
    const contacts = extractContacts("Video uploaded 2024-01-01 at 10 30 00", "src");
    expect(contacts.find((c) => c.type === "phone")).toBeUndefined();
  });

  it("never fabricates a contact when none is present", () => {
    expect(extractContacts("Just a normal video description with no contact info.", "src")).toHaveLength(0);
  });
});

describe("pickPrimaryContact", () => {
  it("prefers whatsapp over other types", () => {
    const best = pickPrimaryContact([
      { type: "email", value: "a@b.com", source: "x", confidence: "high" },
      { type: "whatsapp", value: "+201012345678", source: "x", confidence: "high" },
    ]);
    expect(best?.type).toBe("whatsapp");
  });
});
