-- Savour schema: the DDL applied to Supabase project exujoxhylnyrvhmqqnhx, verbatim,
-- plus drop-if-exists guards so re-running it is safe. Edit here, then re-apply in the Dashboard.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.places (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name             text not null,
  city             text not null,
  state            text not null,
  area             text,
  address          text,
  lat              numeric(9,6),
  lng              numeric(9,6),
  cuisines         text[] not null default '{}',
  price_band       text not null default '₹₹' check (price_band in ('₹','₹₹','₹₹₹','₹₹₹₹')),
  cost_for_two     integer check (cost_for_two > 0),
  rating           numeric(2,1) check (rating between 0 and 5),
  num_reviews      integer not null default 0 check (num_reviews >= 0),
  positive_reviews integer not null default 0 check (positive_reviews >= 0),
  phone            text,
  website          text,
  instagram        text,
  hours            jsonb,
  image_url        text,
  data_source      text not null default 'geo-api',
  verified_at      date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  place_id     uuid not null references public.places(id) on delete cascade,
  name         text not null,
  course       text not null default 'main'
               check (course in ('aperitif','starter','main','breads','dessert','beverage')),
  course_rank  smallint not null default 0,
  description  text,
  price        numeric(8,2) not null check (price >= 0),
  is_veg       boolean,
  is_signature boolean not null default false,
  image_url    text,
  created_at   timestamptz not null default now(),
  unique (place_id, name)
);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  place_id    uuid not null references public.places(id) on delete cascade,
  author      text not null,
  rating      smallint not null check (rating between 1 and 5),
  body        text not null,
  visited_on  date,
  source      text not null default 'curated',
  created_at  timestamptz not null default now()
);

create table if not exists public.wishlist_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  note        text,
  is_default  boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.wishlist_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  list_id       uuid not null references public.wishlist_lists(id) on delete cascade,
  menu_item_id  uuid not null references public.menu_items(id) on delete cascade,
  note          text,
  tried         boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (list_id, menu_item_id)
);

create table if not exists public.savour_flat_import (
  id               bigint generated always as identity primary key,
  city             text not null,
  state            text not null,
  place_name       text not null,
  area             text,
  cuisine          text,
  menu_item        text,
  item_price       numeric(8,2),
  rating           numeric(2,1),
  num_reviews      integer,
  positive_reviews integer,
  review_excerpt   text,
  source_url       text
);

create or replace view public.savour_flat_places with (security_invoker = true) as
select distinct on (city, state, place_name)
       city, state, place_name, area, cuisine,
       rating, num_reviews, positive_reviews, source_url
  from public.savour_flat_import
 order by city, state, place_name, id;

create or replace view public.saved_dishes with (security_invoker = true) as
select wi.id as wish_id, wi.note, wi.tried, wi.created_at as saved_at,
       wl.id as list_id, wl.name as list_name,
       mi.id as menu_item_id, mi.name as dish_name, mi.description,
       mi.course, mi.price, mi.is_veg,
       p.id as place_id, p.slug, p.name as place_name, p.city, p.rating, p.image_url
  from public.wishlist_items wi
  join public.wishlist_lists wl on wl.id = wi.list_id
  join public.menu_items     mi on mi.id = wi.menu_item_id
  join public.places         p  on p.id  = mi.place_id;

create index if not exists places_city_idx      on public.places (city, state);
create index if not exists places_cuisine_gin   on public.places using gin (cuisines);
create index if not exists places_name_trgm     on public.places using gin (name gin_trgm_ops);
create index if not exists menu_items_place_idx on public.menu_items (place_id, course_rank);
create index if not exists menu_items_price_idx on public.menu_items (price);
create index if not exists menu_items_search_idx on public.menu_items
  using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')));
create index if not exists reviews_place_idx on public.reviews (place_id, rating desc);
create index if not exists lists_user_idx    on public.wishlist_lists (user_id);
create index if not exists items_user_idx    on public.wishlist_items (user_id);

alter table public.places             enable row level security;
alter table public.menu_items         enable row level security;
alter table public.reviews            enable row level security;
alter table public.wishlist_lists     enable row level security;
alter table public.wishlist_items     enable row level security;
alter table public.savour_flat_import enable row level security;

drop policy if exists places_read on public.places;
create policy places_read     on public.places      for select to anon, authenticated using (true);
drop policy if exists menu_items_read on public.menu_items;
create policy menu_items_read on public.menu_items  for select to anon, authenticated using (true);
drop policy if exists reviews_read on public.reviews;
create policy reviews_read    on public.reviews     for select to anon, authenticated using (true);

drop policy if exists lists_own on public.wishlist_lists;
create policy lists_own on public.wishlist_lists for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists items_own on public.wishlist_items;
create policy items_own on public.wishlist_items for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists items_cap on public.wishlist_items;
create policy items_cap on public.wishlist_items for insert to authenticated
  with check ((select auth.uid()) = user_id
    and (select count(*) from public.wishlist_items wi
          where wi.user_id = (select auth.uid())) < 300);

drop policy if exists lists_cap on public.wishlist_lists;
create policy lists_cap on public.wishlist_lists for insert to authenticated
  with check ((select auth.uid()) = user_id
    and (select count(*) from public.wishlist_lists wl
          where wl.user_id = (select auth.uid())) < 25);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists places_touch on public.places;
create trigger places_touch before update on public.places
  for each row execute function public.set_updated_at();
drop trigger if exists lists_touch on public.wishlist_lists;
create trigger lists_touch before update on public.wishlist_lists
  for each row execute function public.set_updated_at();
