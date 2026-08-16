/** §22: Activity — 20 points, based on real last-video timestamp. */
export function scoreActivity(lastVideoAt: string | Date | null): number {
  if (!lastVideoAt) return 0;
  const days = (Date.now() - new Date(lastVideoAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return 20;
  if (days < 30) return 16;
  if (days < 90) return 10;
  if (days < 180) return 5;
  return 0;
}

export function activityLabel(lastVideoAt: string | Date | null): "Very strong" | "Strong" | "Moderate" | "Weak" {
  if (!lastVideoAt) return "Weak";
  const days = (Date.now() - new Date(lastVideoAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return "Very strong";
  if (days < 30) return "Strong";
  if (days < 90) return "Moderate";
  return "Weak";
}
