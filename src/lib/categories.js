// The directory's spine. Adding a category here creates its pages on next build.
export const CATEGORIES = [
  { slug: 'plumbers',     label: 'Plumbers',     one: 'plumber',     icon: 'wrench',  need: 'a plumber' },
  { slug: 'electricians', label: 'Electricians', one: 'electrician', icon: 'bolt',    need: 'an electrician' },
  { slug: 'cleaning',     label: 'Cleaning',     one: 'cleaner',     icon: 'spray',   need: 'a cleaner' },
  { slug: 'movers',       label: 'Movers',       one: 'mover',       icon: 'truck',   need: 'movers' },
  { slug: 'beauty',       label: 'Beauty',       one: 'salon',       icon: 'scissors',need: 'a hairdresser' },
  { slug: 'home-repairs', label: 'Home repairs', one: 'handyman',    icon: 'house',   need: 'a handyman' },
  { slug: 'auto',         label: 'Auto',         one: 'mechanic',    icon: 'car',     need: 'a mechanic' },
  { slug: 'photography',  label: 'Photography',  one: 'photographer',icon: 'camera',  need: 'a photographer' },
];

export const byCategorySlug = (s) => CATEGORIES.find((c) => c.slug === s);
