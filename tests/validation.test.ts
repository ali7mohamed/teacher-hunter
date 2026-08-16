import { describe, it, expect } from "vitest";
import { searchRequestSchema, leadPatchSchema } from "@/lib/validation/search";
import { loginSchema } from "@/lib/validation/auth";

describe("searchRequestSchema", () => {
  it("rejects an empty query", () => {
    expect(searchRequestSchema.safeParse({ query: "" }).success).toBe(false);
  });
  it("rejects a query over 300 characters", () => {
    expect(searchRequestSchema.safeParse({ query: "a".repeat(301) }).success).toBe(false);
  });
  it("accepts a valid query with filters", () => {
    expect(searchRequestSchema.safeParse({ query: "Arabic teacher", filters: { minSubscribers: 1000 } }).success).toBe(true);
  });
});

describe("leadPatchSchema", () => {
  it("rejects an invalid status", () => {
    expect(leadPatchSchema.safeParse({ status: "banana" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});
