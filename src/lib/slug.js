export const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const rands = (n) => 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// SA convention: 4,8 not 4.8
export const rating = (n) => (n == null ? null : String(n.toFixed(1)).replace('.', ','));
