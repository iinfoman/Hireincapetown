import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openState } from '../src/lib/hours.js';

// Cape Town is UTC+2 year-round, so the UTC instants below are chosen to land
// on a specific local time. 2026-09-16 is a Wednesday.
const at = (iso) => new Date(iso);

test('a normal shift is open inside it and shut outside', () => {
  const hours = { wed: ['09:00', '17:00'], emergency24h: false };
  assert.equal(openState(hours, at('2026-09-16T10:00:00Z')).open, true);  // 12:00
  assert.equal(openState(hours, at('2026-09-16T18:00:00Z')).open, false); // 20:00
  assert.equal(openState(hours, at('2026-09-16T05:00:00Z')).open, false); // 07:00
});

test('a shift running past midnight stays open across the day boundary', () => {
  // Regression: to <= from used to fail both branches, so an 18:00-02:00
  // business could never report open at any time of day.
  const hours = { wed: ['18:00', '02:00'], thu: ['18:00', '02:00'], emergency24h: false };
  assert.equal(openState(hours, at('2026-09-16T21:00:00Z')).open, true);  // 23:00 Wed
  assert.equal(openState(hours, at('2026-09-16T23:00:00Z')).open, true);  // 01:00 Thu
  assert.equal(openState(hours, at('2026-09-16T13:00:00Z')).open, false); // 15:00 Wed
});

test('a 24-hour callout counts as open when the shift is over', () => {
  const hours = { wed: ['07:30', '17:00'], emergency24h: true };
  const state = openState(hours, at('2026-09-16T20:00:00Z')); // 22:00
  assert.equal(state.open, true);
  assert.match(state.label, /emergenc/i);
});

test('missing hours never claim to be open', () => {
  assert.equal(openState(null).open, false);
  assert.equal(openState(undefined).open, false);
});
