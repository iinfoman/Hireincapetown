import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rating, slugify, rands } from '../src/lib/slug.js';

test('an absent rating is absent, not zero', () => {
  // Regression: callers passed Number(avg) first, so null became 0 and a newly
  // verified business advertised "0,0" — which reads as a terrible score
  // rather than no score.
  assert.equal(rating(null), null);
  assert.equal(rating(undefined), null);
  assert.equal(rating(''), null);
});

test('a genuine zero is still rendered', () => {
  assert.equal(rating(0), '0,0');
});

test('accepts the numeric string Postgres returns for numeric(2,1)', () => {
  assert.equal(rating('4.8'), '4,8');
  assert.equal(rating(4.8), '4,8');
});

test('uses the SA decimal comma', () => {
  assert.ok(rating(4.4).includes(','));
  assert.ok(!rating(4.4).includes('.'));
});

test('slugify handles suburbs with punctuation and accents', () => {
  assert.equal(slugify("Mitchells Plain"), 'mitchells-plain');
  assert.equal(slugify("Mouille Point"), 'mouille-point');
  assert.equal(slugify("St James"), 'st-james');
});

test('rands are grouped with a space, SA style', () => {
  assert.equal(rands(450), 'R450');
  assert.equal(rands(1200), 'R1 200');
});
