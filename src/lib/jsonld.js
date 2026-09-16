/**
 * Serialise structured data for embedding in a <script type="application/ld+json">.
 *
 * Inside a script element the HTML parser looks for "</script" before it looks
 * at JSON, so a business description containing one would close the block and
 * the rest would run as markup. Business descriptions become user-submitted the
 * moment the registration flow lands, which makes this the difference between
 * valid structured data and stored XSS.
 *
 * U+2028 and U+2029 are legal inside JSON strings but are line terminators in
 * JavaScript, so they are escaped too. They are matched by code point rather
 * than written literally — a raw one in this file would break the regex itself.
 */
const SCRIPT_UNSAFE = /[<\u2028\u2029]/g;

const ESCAPES = {
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export const ldJson = (value) =>
  JSON.stringify(value).replace(SCRIPT_UNSAFE, (c) => ESCAPES[c]);
