// Password-gates everything under /tools/ — the listings dashboard and the
// single-listing form. Runs at Netlify's edge before any file is served, so
// the HTML never reaches an unauthenticated visitor.
//
// Why HTTP Basic rather than a login page: there is no session store, no
// cookie to forge, no password reset flow and no user table. The browser
// remembers it, it works identically on a phone, and it costs nothing —
// Netlify's paid "password protection" feature is not needed for this.
//
// Set the password once: Netlify -> Site configuration -> Environment
// variables -> TOOLS_PASSWORD. Any username works; only the password matters.

const REALM = 'HireInCapeTown admin';

/** Constant-time compare, so a wrong password cannot be narrowed down by timing. */
function same(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  // Compare the longer length either way: returning early on a length
  // mismatch would leak the password's length.
  const n = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function page(title, body, status) {
  return new Response(
    `<!doctype html><html lang="en-ZA"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#161C24;
color:#E4E7EC;font:15px/1.6 system-ui,sans-serif;padding:24px}
div{max-width:460px}h1{font-size:19px;margin:0 0 10px;color:#fff}
p{color:#A3AEBB;margin:0 0 10px}code{background:#0F141A;padding:2px 6px;border-radius:5px;
font-size:13px;color:#E4E7EC}</style></head>
<body><div><h1>${title}</h1>${body}</div></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' } }
  );
}

export default async (request, context) => {
  const expected = Netlify.env.get('TOOLS_PASSWORD');

  // Fail closed. An unset password must never mean "let everyone in" — that
  // is exactly the accident this function exists to prevent.
  if (!expected) {
    return page('Admin tools are locked',
      `<p>No password has been set yet, so these pages are closed to everyone.</p>
       <p>In Netlify: <b>Site configuration</b> &rarr; <b>Environment variables</b> &rarr;
       add <code>TOOLS_PASSWORD</code>, then redeploy.</p>`, 503);
  }

  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(header.slice(6)); } catch { decoded = ''; }
    // Only the password is checked; the username can be anything, so there is
    // one secret to remember rather than two.
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (decoded.includes(':') && same(password, expected)) {
      const res = await context.next();
      res.headers.set('cache-control', 'private, no-store');
      res.headers.set('x-robots-tag', 'noindex, nofollow');
      return res;
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'www-authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
};

export const config = { path: '/tools/*' };
