-- HireInCapeTown — initial schema (Neon / Postgres 16)
--
-- Two things in here are load-bearing and should not be "simplified" later:
--   1. reviews carry a composite foreign key back to hires, so a review that
--      isn't backed by a recorded hire between that exact author and that exact
--      business cannot physically exist. The fraud defence is a constraint, not
--      a code path someone can forget.
--   2. verification_docs stores an R2 object key and never the file, and never
--      a URL. POPIA obligations are easier to keep when the bytes were never
--      in the database to begin with.

create extension if not exists "pgcrypto";

create type business_status as enum ('pending', 'verified', 'rejected');
create type review_status   as enum ('published', 'flagged', 'removed');
create type report_status   as enum ('open', 'actioned', 'dismissed');
create type user_role       as enum ('user', 'business', 'admin');
create type quote_urgency   as enum ('now', 'today', 'this_week', 'pricing_only');

-- ---------------------------------------------------------------- profiles

-- id matches the auth provider's user id. Kept as its own table so the rest of
-- the schema has something to reference that we control.
create table profiles (
  id            uuid primary key,
  role          user_role   not null default 'user',
  display_name  text        not null,
  phone         text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- businesses

create table businesses (
  id              uuid            primary key default gen_random_uuid(),
  owner_id        uuid            not null references profiles (id) on delete restrict,
  name            text            not null,
  slug            text            not null unique,
  category        text            not null,
  suburbs_served  text[]          not null default '{}',
  description     text,
  phone           text,
  whatsapp        text,
  status          business_status not null default 'pending',
  rating_avg      numeric(2,1),
  rating_count    integer         not null default 0,
  callout_from    integer,        -- rands, nullable: not every trade quotes a callout
  hours           jsonb,          -- opening hours; drives the "open now" filter
  created_at      timestamptz     not null default now(),
  updated_at      timestamptz     not null default now()
);

-- The directory's only hot query: category + suburb, best-rated first.
create index businesses_category_status_idx on businesses (category, status);
create index businesses_suburbs_idx         on businesses using gin (suburbs_served);
create index businesses_ranking_idx         on businesses (status, rating_avg desc nulls last);

-- ---------------------------------------------------------------- hires

-- The proof-of-transaction that gates reviews.
create table hires (
  id           uuid        primary key default gen_random_uuid(),
  business_id  uuid        not null references businesses (id) on delete cascade,
  user_id      uuid        not null references profiles (id)   on delete cascade,
  hired_on     date        not null default current_date,
  created_at   timestamptz not null default now()
);

create index hires_business_idx on hires (business_id);
create index hires_user_idx     on hires (user_id);

-- Lets reviews reference the (hire, business, author) triple as a unit.
alter table hires
  add constraint hires_identity_key unique (id, business_id, user_id);

-- ---------------------------------------------------------------- reviews

create table reviews (
  id           uuid          primary key default gen_random_uuid(),
  business_id  uuid          not null,
  author_id    uuid          not null,
  hire_id      uuid          not null unique,   -- one review per recorded hire
  rating       smallint      not null check (rating between 1 and 5),
  body         text,
  status       review_status not null default 'published',
  created_at   timestamptz   not null default now(),

  constraint reviews_business_fk foreign key (business_id) references businesses (id) on delete cascade,
  constraint reviews_author_fk   foreign key (author_id)   references profiles (id)   on delete cascade,

  -- The fraud defence. A review can only exist if the referenced hire is a hire
  -- of THIS business by THIS author.
  constraint reviews_hire_matches foreign key (hire_id, business_id, author_id)
    references hires (id, business_id, user_id) on delete restrict
);

create index reviews_business_idx on reviews (business_id, status);

-- Keep the denormalised rating on businesses in step with published reviews.
create or replace function refresh_business_rating() returns trigger
language plpgsql as $$
declare
  target uuid := coalesce(new.business_id, old.business_id);
begin
  update businesses b
     set rating_avg = sub.avg_rating,
         rating_count = sub.n,
         updated_at = now()
    from (
      select round(avg(rating)::numeric, 1) as avg_rating, count(*) as n
        from reviews
       where business_id = target and status = 'published'
    ) sub
   where b.id = target;
  return null;
end;
$$;

create trigger reviews_refresh_rating
after insert or update or delete on reviews
for each row execute function refresh_business_rating();

-- ---------------------------------------------------------------- verification

-- Metadata only. r2_key points at a private Cloudflare R2 object that is never
-- served to a browser — the admin UI fetches it through a short-lived signed URL
-- minted server-side. The public profile shows checked_at, never the document.
create table verification_docs (
  id           uuid        primary key default gen_random_uuid(),
  business_id  uuid        not null references businesses (id) on delete cascade,
  doc_type     text        not null check (doc_type in ('id_document', 'proof_of_address', 'trade_registration', 'liability_cover')),
  r2_key       text        not null,
  checked_at   timestamptz,
  checked_by   uuid        references profiles (id),
  expires_on   date,
  created_at   timestamptz not null default now()
);

create index verification_docs_business_idx on verification_docs (business_id);

-- ---------------------------------------------------------------- reports

create table reports (
  id           uuid          primary key default gen_random_uuid(),
  business_id  uuid          not null references businesses (id) on delete cascade,
  reporter_id  uuid          references profiles (id) on delete set null,
  reason       text          not null,
  detail       text,
  status       report_status not null default 'open',
  created_at   timestamptz   not null default now()
);

create index reports_open_idx on reports (status, created_at desc);

-- ---------------------------------------------------------------- quote requests

create table quote_requests (
  id             uuid          primary key default gen_random_uuid(),
  requester_id   uuid          references profiles (id) on delete set null,
  category       text          not null,
  suburb         text          not null,
  description    text          not null,
  needed_when    quote_urgency not null,
  contact_phone  text          not null,
  created_at     timestamptz   not null default now()
);

-- Which businesses a request fanned out to, and what came back.
create table quote_request_recipients (
  quote_request_id uuid        not null references quote_requests (id) on delete cascade,
  business_id      uuid        not null references businesses (id)     on delete cascade,
  sent_at          timestamptz not null default now(),
  responded_at     timestamptz,
  primary key (quote_request_id, business_id)
);

create index quote_recipients_business_idx on quote_request_recipients (business_id, sent_at desc);
