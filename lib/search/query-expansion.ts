/**
 * Expands a user query into a small set of related searches (§8).
 * Deterministic string variants — no AI call needed for this.
 */
const MAX_QUERIES = 5;

const ARABIC_TEACHER_SYNONYMS = ["مدرس", "مدرسة", "أستاذ", "معلم"];
const ARABIC_EXPLAIN_WORDS = ["شرح"];

export function expandSearchQuery(rawQuery: string): string[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const queries = new Set<string>([query]);
  const isArabic = /[\u0600-\u06FF]/.test(query);

  if (isArabic) {
    for (const synonym of ARABIC_TEACHER_SYNONYMS) {
      if (query.includes(synonym)) continue;
      if (queries.size >= MAX_QUERIES) break;
      queries.add(`${synonym} ${query}`);
    }
    for (const word of ARABIC_EXPLAIN_WORDS) {
      if (queries.size >= MAX_QUERIES) break;
      queries.add(`${word} ${query}`);
    }
  } else {
    if (!/teacher/i.test(query) && queries.size < MAX_QUERIES) queries.add(`${query} teacher`);
    if (!/lesson|tutorial|explained/i.test(query) && queries.size < MAX_QUERIES) queries.add(`${query} lesson explained`);
  }

  return Array.from(queries).slice(0, MAX_QUERIES);
}
