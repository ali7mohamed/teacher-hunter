import { describe, it, expect } from "vitest";
import { expandSearchQuery } from "@/lib/search/query-expansion";

describe("expandSearchQuery", () => {
  it("returns empty for blank input", () => {
    expect(expandSearchQuery("  ")).toEqual([]);
  });
  it("always includes the original query", () => {
    expect(expandSearchQuery("Physics teacher Egypt")).toContain("Physics teacher Egypt");
  });
  it("caps expansion at a reasonable number of queries", () => {
    expect(expandSearchQuery("مدرس عربي").length).toBeLessThanOrEqual(5);
  });
});
