-- HireInCapeTown — initial schema
--
-- This lives in its OWN Postgres schema (`hireincapetown`) because the database
-- is shared with the SolarinstallersSA project. Nothing here touches `public`,
-- so Solar's tables are unaffected and either app can be lifted out later by
-- dumping a single schema.
--
-- Three things in here are load-bearing and should not be "simplified" later:
--   1. reviews carry a composite foreign key back to hires, so a review that
--      isn't backed by a recorded hire between that exact author and that exact
--      business cannot physically exist. The fraud defence is a constraint, not
--      a code path someone can forget.
--   2. verification_docs stores a Storage object path and never the file, and
--      never a URL. POPIA obligations are easier to keep when the bytes were
--      never in the database to begin with.
--   3. RLS is on for every table. auth.users is SHARED with Solar, so a signed-in
--      Solar user is a signed-in user here too. Membership of this app is
--      hireincapetown.profiles — having an auth account grants nothing by itself.

create schema if not exists hireincapetown;

do $$ begin
  create type hireincapetown.business_status as enum ('pending', 'verified', 'rejected');
  create type hireincapetown.review_status   as enum ('published', 'flagged', 'removed');
  create type hireincapetown.report_status   as enum ('open', 'actioned', 'dismissed');
  create type hireincapetown.user_role       as enum ('user', 'business', 'admin');
  create type hireincapetown.quote_urgency   as enum ('now', 'today', 'this_week', 'pricing_only');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------- profiles

-- A row here is what makes an auth user a member of THIS app. Solar's users
-- have no row, and therefore no standing.
create table if not exists hireincapetown.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          hireincapetown.user_role not null default 'user',
  display_name  text        not null,
  phone         text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- businesses

create table if not exists hireincapetown.businesses (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references hireincapetown.profiles (id) on delete restrict,
  name            text not null,
  slug            text not null unique,
  category        text not null,
  suburbs_served  text[] not null default '{}',
  services        text[] not null default '{}',
  description     text,
  phone           text,
  whatsapp        text,
  status          hireincapetown.business_status not null default 'pending',
  rating_avg      numeric(2,1),
  rating_count    integer not null default 0,
  callout_from    integer,
  hours           jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists businesses_category_status_idx on hireincapetown.businesses (category, status);
create index if not exists businesses_suburbs_idx         on hireincapetown.businesses using gin (suburbs_served);
create index if not exists businesses_ranking_idx         on hireincapetown.businesses (status, rating_avg desc nulls last);

-- ---------------------------------------------------------------- hires

create table if not exists hireincapetown.hires (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references hireincapetown.businesses (id) on delete cascade,
  user_id      uuid not null references hireincapetown.profiles (id)   on delete cascade,
  hired_on     date not null default current_date,
  created_at   timestamptz not null default now(),
  constraint hires_identity_key unique (id, business_id, user_id)
);

create index if not exists hires_business_idx on hireincapetown.hires (business_id);
create index if not exists hires_user_idx     on hireincapetown.hires (user_id);

-- ---------------------------------------------------------------- reviews

create table if not exists hireincapetown.reviews (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null,
  author_id    uuid not null,
  hire_id      uuid not null unique,
  rating       smallint not null check (rating between 1 and 5),
  body         text,
  status       hireincapetown.review_status not null default 'published',
  created_at   timestamptz not null default now(),

  constraint reviews_business_fk foreign key (business_id) references hireincapetown.businesses (id) on delete cascade,
  constraint reviews_author_fk   foreign key (author_id)   references hireincapetown.profiles (id)   on delete cascade,
  constraint reviews_hire_matches foreign key (hire_id, business_id, author_id)
    references hireincapetown.hires (id, business_id, user_id) on delete restrict
);

create index if not exists reviews_business_idx on hireincapetown.reviews (business_id, status);

create or replace function hireincapetown.refresh_business_rating() returns trigger
language plpgsql security definer set search_path = hireincapetown, public as $$
declare
  target uuid := coalesce(new.business_id, old.business_id);
begin
  update hireincapetown.businesses b
     set rating_avg = sub.avg_rating, rating_count = sub.n, updated_at = now()
    from (select round(avg(rating)::numeric, 1) as avg_rating, count(*) as n
            from hireincapetown.reviews
           where business_id = target and status = 'published') sub
   where b.id = target;
  return null;
end; $$;

drop trigger if exists reviews_refresh_rating on hireincapetown.reviews;
create trigger reviews_refresh_rating
after insert or update or delete on hireincapetown.reviews
for each row execute function hireincapetown.refresh_business_rating();

-- ---------------------------------------------------------------- verification

create table if not exists hireincapetown.verification_docs (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references hireincapetown.businesses (id) on delete cascade,
  doc_type     text not null check (doc_type in ('id_document', 'proof_of_address', 'trade_registration', 'liability_cover')),
  storage_path text not null,
  -- Specific name of the check, e.g. 'PIRB plumber registration'. The profile
  -- page shows this instead of the generic doc_type when present.
  label        text,
  checked_at   timestamptz,
  checked_by   uuid references hireincapetown.profiles (id),
  expires_on   date,
  created_at   timestamptz not null default now()
);

create index if not exists verification_docs_business_idx on hireincapetown.verification_docs (business_id);

-- ---------------------------------------------------------------- reports

create table if not exists hireincapetown.reports (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references hireincapetown.businesses (id) on delete cascade,
  reporter_id  uuid references hireincapetown.profiles (id) on delete set null,
  reason       text not null,
  detail       text,
  status       hireincapetown.report_status not null default 'open',
  created_at   timestamptz not null default now()
);

create index if not exists reports_open_idx on hireincapetown.reports (status, created_at desc);

-- ---------------------------------------------------------------- quote requests

create table if not exists hireincapetown.quote_requests (
  id             uuid primary key default gen_random_uuid(),
  requester_id   uuid references hireincapetown.profiles (id) on delete set null,
  category       text not null,
  suburb         text not null,
  description    text not null,
  needed_when    hireincapetown.quote_urgency not null,
  contact_phone  text not null,
  created_at     timestamptz not null default now()
);

create table if not exists hireincapetown.quote_request_recipients (
  quote_request_id uuid not null references hireincapetown.quote_requests (id) on delete cascade,
  business_id      uuid not null references hireincapetown.businesses (id)     on delete cascade,
  sent_at          timestamptz not null default now(),
  responded_at     timestamptz,
  primary key (quote_request_id, business_id)
);

create index if not exists quote_recipients_business_idx on hireincapetown.quote_request_recipients (business_id, sent_at desc);

-- ---------------------------------------------------------------- RLS
--
-- Default deny everywhere. The public internet may read verified listings and
-- nothing else. Note is_member(): auth.users is shared with Solar, so we never
-- treat "signed in" as "belongs here".

alter table hireincapetown.profiles                 enable row level security;
alter table hireincapetown.businesses               enable row level security;
alter table hireincapetown.hires                    enable row level security;
alter table hireincapetown.reviews                  enable row level security;
alter table hireincapetown.verification_docs        enable row level security;
alter table hireincapetown.reports                  enable row level security;
alter table hireincapetown.quote_requests           enable row level security;
alter table hireincapetown.quote_request_recipients enable row level security;

create or replace function hireincapetown.is_member() returns boolean
language sql stable security definer set search_path = hireincapetown, public as $$
  select exists (select 1 from hireincapetown.profiles p where p.id = auth.uid());
$$;

create or replace function hireincapetown.is_admin() returns boolean
language sql stable security definer set search_path = hireincapetown, public as $$
  select exists (select 1 from hireincapetown.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

drop policy if exists businesses_public_read on hireincapetown.businesses;
create policy businesses_public_read on hireincapetown.businesses
  for select using (status = 'verified');

drop policy if exists businesses_owner_read on hireincapetown.businesses;
create policy businesses_owner_read on hireincapetown.businesses
  for select using (owner_id = auth.uid() or hireincapetown.is_admin());

drop policy if exists businesses_owner_write on hireincapetown.businesses;
create policy businesses_owner_write on hireincapetown.businesses
  for update using (owner_id = auth.uid() or hireincapetown.is_admin());

drop policy if exists reviews_public_read on hireincapetown.reviews;
create policy reviews_public_read on hireincapetown.reviews
  for select using (status = 'published');

-- The fraud defence again, this time at the row level: you may only insert a
-- review whose hire is your own. The composite FK above enforces the rest.
drop policy if exists reviews_author_insert on hireincapetown.reviews;
create policy reviews_author_insert on hireincapetown.reviews
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from hireincapetown.hires h
                 where h.id = hire_id and h.user_id = auth.uid() and h.business_id = business_id)
  );

drop policy if exists profiles_self on hireincapetown.profiles;
create policy profiles_self on hireincapetown.profiles
  for select using (id = auth.uid() or hireincapetown.is_admin());

drop policy if exists hires_own on hireincapetown.hires;
create policy hires_own on hireincapetown.hires
  for select using (user_id = auth.uid() or hireincapetown.is_admin());

drop policy if exists reports_insert_member on hireincapetown.reports;
create policy reports_insert_member on hireincapetown.reports
  for insert with check (hireincapetown.is_member());

drop policy if exists reports_admin_read on hireincapetown.reports;
create policy reports_admin_read on hireincapetown.reports
  for select using (hireincapetown.is_admin());

-- verification_docs: no policy at all, deliberately. RLS is on and nothing
-- grants access, so every client role is denied. ID documents are reachable
-- only server-side with the service role.
