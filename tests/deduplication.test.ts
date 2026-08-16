import { describe, it, expect } from "vitest";
import { dedupeByChannelId } from "@/lib/deduplication/dedupe";

describe("dedupeByChannelId", () => {
  it("keeps only the first occurrence of each channel id", () => {
    const result = dedupeByChannelId([
      { channelId: "a", title: "one" },
      { channelId: "b", title: "two" },
      { channelId: "a", title: "one-again" },
    ]);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.channelId)).toEqual(["a", "b"]);
  });
});
