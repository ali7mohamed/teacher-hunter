/** §19: channel ID is the strongest identity key — dedupe a batch by it. */
export function dedupeByChannelId<T extends { channelId: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.channelId)) continue;
    seen.add(item.channelId);
    result.push(item);
  }
  return result;
}
