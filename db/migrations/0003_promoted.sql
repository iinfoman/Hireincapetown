-- Paid placement.
--
-- Promoted moves a listing to the top of its category and suburb pages and
-- puts a "Promoted" label on the card. It does NOT touch status: a promoted
-- listing that has not been checked still says "Not verified yet". Money buys
-- position, never the badge, and that separation is the whole reason the badge
-- is worth anything.
alter table hireincapetown.businesses
  add column if not exists promoted boolean not null default false;

create index if not exists businesses_promoted_idx
  on hireincapetown.businesses (category, promoted desc, rating_avg desc nulls last);
