// Site-wide facts that live in exactly one place.
//
// CONTACT_EMAIL is the only way anyone reaches HireInCapeTown from the site:
// a business owner asking to be listed, someone reporting a bad experience,
// and a POPIA access or removal request all land here. Set it to the real
// address and every page that needs it picks it up.
//
// Left empty, the contact blocks are omitted rather than rendering a dead
// mailto: — and scripts/prerender.mjs says so loudly at build time, because a
// "list your business" page with no way to get in touch is worse than no page.
export const CONTACT_EMAIL = '';

export const RESPONSIBLE_PARTY = 'HireInCapeTown';

export const mailto = (subject) =>
  CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` : null;
