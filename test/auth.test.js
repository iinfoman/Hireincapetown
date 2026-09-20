import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

// The admin tools are private only if this function is. It is the single
// thing standing between the internet and the listings editor, so it is
// tested like it matters: prefix attacks, malformed input, and above all
// that an unset password fails closed rather than open.
const src = readFileSync('netlify/edge-functions/protect-tools.js', 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const basic = (u, p) => 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
const req = (auth) => new Request('https://x/tools/dashboard/', auth ? { headers: { authorization: auth } } : {});
const ctx = { next: async () => new Response('SECRET DASHBOARD', { headers: {} }) };

const withPassword = (v, fn) => {
  globalThis.Netlify = { env: { get: (k) => (k === 'TOOLS_PASSWORD' ? v : undefined) } };
  return fn();
};

test('no password set: closed, never open', async () => {
  const r = await withPassword(undefined, () => mod.default(req(), ctx));
  assert.equal(r.status, 503);
  assert.doesNotMatch(await r.text(), /SECRET DASHBOARD/);
});

test('no credentials: challenges', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(), ctx));
  assert.equal(r.status, 401);
  assert.match(r.headers.get('www-authenticate'), /^Basic realm=/);
});

test('wrong password: denied', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(basic('me', 'nope')), ctx));
  assert.equal(r.status, 401);
});

test('password that is a prefix of the real one: denied', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(basic('me', 'hunter')), ctx));
  assert.equal(r.status, 401);
});

test('longer password sharing a prefix: denied', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(basic('me', 'hunter22')), ctx));
  assert.equal(r.status, 401);
});

test('correct password, any username: allowed', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(basic('anything', 'hunter2')), ctx));
  assert.equal(r.status, 200);
  assert.match(await r.text(), /SECRET DASHBOARD/);
});

test('password containing a colon survives', async () => {
  const pw = 'a:b:c';
  const r = await withPassword(pw, () => mod.default(req(basic('me', pw)), ctx));
  assert.equal(r.status, 200);
});

test('malformed base64: denied, does not throw', async () => {
  const r = await withPassword('hunter2', () => mod.default(req('Basic !!!not base64!!!'), ctx));
  assert.equal(r.status, 401);
});

test('empty password supplied against a real one: denied', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(basic('me', '')), ctx));
  assert.equal(r.status, 401);
});

test('authorised response is not cached by shared caches', async () => {
  const r = await withPassword('hunter2', () => mod.default(req(basic('me', 'hunter2')), ctx));
  assert.match(r.headers.get('cache-control'), /private|no-store/);
});
