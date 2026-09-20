// Reviews live in db/seed.json alongside the business, and the rating is
// derived from them rather than stored beside them.
//
// Storing an average next to the reviews that produce it means the two can
// disagree, and the one you would trust is never the one on screen. Deriving
// it makes that impossible.
//
// Only 'published' reviews count. A removed review keeps its record — you may
// need to show what was said and when it came down — but it scores nothing and
// renders nowhere.

export const isPublished = (r) => (r?.status ?? 'published') === 'published';

export const published = (reviews) => (reviews ?? []).filter(isPublished);

/** null when there is nothing to average — never 0, which reads as a bad score. */
export function ratingFrom(reviews) {
  const live = published(reviews);
  if (!live.length) return { rating_avg: null, rating_count: 0 };
  const total = live.reduce((n, r) => n + Number(r.rating || 0), 0);
  return {
    rating_avg: Math.round((total / live.length) * 10) / 10,
    rating_count: live.length,
  };
}

/** Newest first. A review with no date sorts last rather than throwing. */
export const byNewest = (a, b) => String(b.date ?? '').localeCompare(String(a.date ?? ''));
