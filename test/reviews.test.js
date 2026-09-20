// The rating is the number a customer decides on, so the arithmetic behind it
// is worth pinning down — especially the cases that would quietly mislead.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ratingFrom, published, byNewest } from '../src/lib/reviews.js';

test('no reviews gives no rating, not zero', () => {
  assert.deepEqual(ratingFrom([]), { rating_avg: null, rating_count: 0 });
  assert.deepEqual(ratingFrom(undefined), { rating_avg: null, rating_count: 0 });
});

test('averages and rounds to one decimal', () => {
  const r = ratingFrom([{ rating: 5 }, { rating: 4 }, { rating: 4 }]);
  assert.equal(r.rating_avg, 4.3);
  assert.equal(r.rating_count, 3);
});

test('removed reviews score nothing and are not counted', () => {
  const r = ratingFrom([
    { rating: 5, status: 'published' },
    { rating: 1, status: 'removed' },
  ]);
  assert.equal(r.rating_avg, 5);
  assert.equal(r.rating_count, 1);
});

test('a review with no status counts as published', () => {
  assert.equal(ratingFrom([{ rating: 4 }]).rating_count, 1);
  assert.equal(published([{ rating: 4 }]).length, 1);
});

test('every review removed reads as no reviews, not as zero stars', () => {
  assert.deepEqual(ratingFrom([{ rating: 5, status: 'removed' }]),
    { rating_avg: null, rating_count: 0 });
});

test('newest first, and a missing date sorts last rather than throwing', () => {
  const list = [{ date: '2026-01-05' }, { date: undefined }, { date: '2026-09-01' }];
  const sorted = [...list].sort(byNewest);
  assert.equal(sorted[0].date, '2026-09-01');
  assert.equal(sorted[2].date, undefined);
});
