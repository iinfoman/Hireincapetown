export const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const rands = (n) => 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// SA convention: 4,8 not 4.8. Accepts the numeric string Postgres returns for
// numeric(2,1); a business with no reviews yet has no rating, not a rating of 0.
export const rating = (n) => {
  if (n === null || n === undefined || n === '') return null;
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(1).replace('.', ',') : null;
};
