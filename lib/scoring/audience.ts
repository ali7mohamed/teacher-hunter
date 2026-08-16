/** §22: Audience — 30 points. Never scores unavailable subscriber data. */
export function scoreAudience(subscriberCount: number | null): number {
  if (subscriberCount === null) return 0;
  if (subscriberCount < 1_000) return 5;
  if (subscriberCount < 10_000) return 10;
  if (subscriberCount < 50_000) return 18;
  if (subscriberCount < 100_000) return 22;
  if (subscriberCount < 500_000) return 27;
  return 30;
}
