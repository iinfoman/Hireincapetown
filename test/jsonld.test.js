import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ldJson } from '../src/lib/jsonld.js';

// Built by code point on purpose: a literal U+2028 in this file would itself be
// a line terminator and break the test before it could run. That is the same
// hazard the function under test exists to neutralise.
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

test('a description cannot close the script block', () => {
  // Regression: a bare JSON.stringify let a business description containing
  // </script> end the block, turning the rest into live markup. Business
  // descriptions become user-submitted as soon as registration ships.
  const out = ldJson({ description: 'Ends it: </script><img src=x onerror=alert(1)>' });
  assert.ok(!out.includes('</script'), 'raw </script must never survive');
  assert.ok(out.includes('u003c'), 'the < should be escaped');
});

test('escaped output still parses back to the original value', () => {
  const value = { name: 'Bobby </script> Plumbing', rating: 4.8 };
  assert.deepEqual(JSON.parse(ldJson(value)), value);
});

test('line separators legal in JSON but not in JS are escaped', () => {
  const out = ldJson({ body: `a${LINE_SEP}b${PARA_SEP}c` });
  assert.ok(!out.includes(LINE_SEP), 'U+2028 must not survive raw');
  assert.ok(!out.includes(PARA_SEP), 'U+2029 must not survive raw');
  assert.deepEqual(JSON.parse(out), { body: `a${LINE_SEP}b${PARA_SEP}c` });
});

test('ordinary content is left alone', () => {
  assert.equal(ldJson({ name: 'Kritzinger Plumbing & Drains' }),
    '{"name":"Kritzinger Plumbing & Drains"}');
});
