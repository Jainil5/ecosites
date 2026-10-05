# Savour — design spec

Third showcase site in the portfolio: a Pune food guide where visitors browse real
cafes and restaurants, save individual dishes, and organise them into personal
lists. Supabase (Postgres + RLS) is the datastore. Lives at `/showcase/savour`
alongside Hair Adore and Market Pulse.

Date: 2026-10-04 · Status: approved, pending spec review

## Decisions and their reasons

| Decision | Choice | Why |
|---|---|---|
| Data layer | Supabase, project `exujoxhylnyrvhmqqnhx` | User asked for a real database rather than bundled demo data. |
| User identity | Supabase **anonymous sign-ins**, `auth.uid()` | Per-visitor private rows with no signup screen, and the id is issued server-side so it cannot be forged by a client. A client-supplied device uuid in a header was rejected as spoofable. |
| Catalogue reads | Server Components, `revalidate = 3600` | Pre-rendered pages, and the key is not needed in the client bundle for reads. |
| Wishlist writes | Client Components, `supabase-js` | Saves must feel instant; optimistic update with rollback. |
| Venue data source | OpenStreetMap Overpass API | Free, keyless, and returns name, area, lat/lng, phone, website, `cuisine` and `opening_hours`. |
| Ratings and counts | Verified per venue by web search, stored with `verified_at` | OSM rarely carries ratings and Google Places needs a billed key. Values are real as of the check date, not live. |
| `positive_reviews` | Curated estimate, labelled in the UI footnote | No free source publishes a 4-star-and-up count. Presented as an estimate, not as scraped fact. |
| Menus and prices | Hand-curated from published menus into `seed.sql` | No free API carries menus. |
| AI features | None | Key is provisioned repo-wide but Savour does not call it. |
| Test runner | Vitest, dev-only, pure logic only | Approved 2026-10-04 after the spec's first draft said "not added": filter/sort, the wishlist reducer, Overpass→row transforms and catalogue validation are worth real failing-test-first cycles. Components stay verified in the browser. No React Testing Library. |

## Routes and files

```
app/(sites)/showcase/savour/page.tsx            guide home, server component
app/(sites)/showcase/savour/[slug]/page.tsx     one venue, generateStaticParams
components/sites/savour/Savour.tsx              client shell, provider, header, hero
components/sites/savour/FilterBar.tsx           search, city, cuisine, veg, price, sort
components/sites/savour/DishGrid.tsx            dish results with save button
components/sites/savour/PlaceGrid.tsx           venue cards
components/sites/savour/WishlistDrawer.tsx      lists, notes, tried flag, move between lists
components/sites/savour/MenuList.tsx            course-grouped menu on the venue page
components/sites/savour/ReviewPanel.tsx         reviews plus rating breakdown bars
components/sites/savour/PlaceHeader.tsx         venue meta, hours, contact, maps link
components/sites/savour/types.ts                row types mirroring the schema
components/sites/savour/server.ts               server-only client + typed queries
components/sites/savour/wishlist.tsx            anonymous session + wishlist hook
components/sites/savour/fallback-data.ts        3-venue subset used only when unconfigured
supabase/schema.sql                             the applied DDL, copied from this spec
supabase/seed.sql                               Pune catalogue, idempotent
content/websites/sites.ts                       gallery entry for the new site
public/showcase/savour/preview.png              gallery screenshot
```

Non-component modules live beside the components, matching how Market Pulse keeps
`types.ts`, `format.ts`, `indicators.ts` and `useStocks.ts` inside
`components/sites/stock-screener/`. No new top-level `lib/` directory.

`supabase/schema.sql` does not exist yet — the DDL currently lives only in this
spec's appendix and in the chat where it was run. Committing it is the first
implementation task, so the applied schema is reproducible from the repo.

`content/websites/types.ts` needs no change; the existing `SampleWebsite` shape
already covers slug, title, business, description, path, theme, accent,
techStack and screenshot.

## Interface

Dark food-guide tokens in a scoped `.savour` block in `globals.css`, so the
portfolio chrome and both existing demos are unaffected: espresso `#14100E`
canvas, amber `#E8A33D` accent, cream `#F4EDE2` text. `Fraunces` added to the
root `next/font` import for display type; body stays on the existing sans.

Home has two section-level tabs — **Items** (individual dishes across every
venue) and **Places** (one card per venue) — because Jainil asked for the two
entity grids to be switchable rather than stacked. They are a view switch over
one shared filter state, not separate data sources: the same search, city,
cuisine, band, veg and sort controls drive whichever tab is open, and
`filterPlaces` groups the same dish cards by venue so the two tabs can never
disagree about what "filtered" means. Each tab label carries its live result
count. Within a tab everything that matches is rendered at once, and a venue
page still lists every course in one scroll — no intra-page tabs.

The tab bar is the second row of the sticky header rather than its own sticky
element, so the two bars never need matching `top` offsets.

Order: header with search and tabs, hero, filter bar, active grid, wishlist
drawer trigger. The tablist is keyboard-operable (arrow keys, Home/End) with
`role="tab"`/`role="tabpanel"` and roving tabindex.

Venue page: hero image, rating and review count, cost for two, hours, address
with a maps deep-link, menu grouped by course with a save button per dish, then
reviews with rating-breakdown bars.

Accessibility: `aria-pressed` on save buttons, drawer dismissable by keyboard
with focus trap, a polite live region announcing "Saved Butter Chicken to Want
to try", and all animation behind `prefers-reduced-motion`.

## Failure handling

- Missing or empty env vars → `isSupabaseConfigured()` returns false → home
  renders `fallback-data.ts` with a visible "demo data degraded" strip, and the
  save buttons are disabled with a tooltip. The page never shows an error.
- `generateStaticParams` wraps its query in try/catch returning `[]`, so a
  Supabase outage cannot fail `next build`; routes render on demand instead.
- A failed wishlist mutation rolls back the optimistic state and shows an inline
  retry.
- Anonymous sign-ins disabled → every wishlist read returns empty and writes
  return 401. Surfaced once as a drawer notice rather than silently. **This is
  the current live state of the project** and must be toggled before the demo is
  presented.

## Verification

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` — all clean.
2. Seed applied: `places`, `menu_items`, `reviews` each return rows over REST with
   the publishable key.
3. Golden path in Chrome: save a dish, reload, still present; create a list, add
   a note, mark tried, move an item between lists.
4. **RLS negative test** — the check that matters: two separate browser profiles
   must not see each other's saved dishes. A schema that merely claims tenant
   isolation is not evidence it has it.
5. Confirm `saved_dishes` is still `security_invoker = true`; without it the view
   runs as its owner, bypasses RLS, and leaks every visitor's wishlist.
6. Capture `preview.png` for the gallery card.

## Deployment tail

Required before the demo is viewable by anyone else:

1. Add both `NEXT_PUBLIC_SAVOUR_*` vars in Vercel → Project Settings →
   Environment Variables, then redeploy. Without them production silently takes
   the fallback-data path.
2. `git push` and confirm the Vercel build.
3. `supabase/schema.sql` is already applied to the live project and verified
   column-by-column; `seed.sql` still needs running.

## Out of scope

Reservations, ordering or delivery integration, real user accounts, maps
rendering, a `cities` or `cuisines` lookup table, a test framework, any AI
feature, and automated data refresh. Re-running the import is a documented manual
step.

## Open items at time of writing

- Supabase env vars not yet added in the Vercel project.
- Anonymous sign-ins disabled (422 observed 2026-10-04).
- `NVIDIA_API_KEY` in `.env.local` is 35 characters and probably truncated; there
  is no free non-billable way to validate it. Unrelated to Savour.
- No seed data yet, so the catalogue tables are empty.

## Appendix — applied schema

Six tables and two views, already live and column-verified:

- `places` — venue: slug, name, city, state, area, address, lat/lng, `cuisines
  text[]`, price_band, cost_for_two, rating, num_reviews, positive_reviews,
  phone, website, instagram, `hours jsonb`, image_url, data_source, verified_at.
- `menu_items` — place_id FK cascade, name, course (checked enum of six values),
  course_rank, description, price, is_veg (nullable), is_signature, unique
  `(place_id, name)`.
- `reviews` — place_id FK, author, rating 1-5, body, visited_on, source.
- `wishlist_lists` — `user_id` referencing `auth.users`, name, note, is_default,
  position, unique `(user_id, name)`.
- `wishlist_items` — user_id, list_id, menu_item_id all FK cascade, note, tried,
  unique `(list_id, menu_item_id)`.
- `savour_flat_import` — the city-wise staging shape, RLS-enabled with no read
  policy so visitors cannot query it.
- `saved_dishes`, `savour_flat_places` — views, both defined with
  `with (security_invoker = true)`. Their existence and columns are verified over
  REST; the invoker property itself is not verifiable with a publishable key, so
  it is a checklist item rather than a confirmed fact.

Security posture: catalogue tables have `select` policies for `anon` and
`authenticated` only, so writes are impossible from a client. Wishlist tables use
one `for all` policy each, `(select auth.uid()) = user_id`, plus insert-cap
policies (300 items, 25 lists) because anonymous identities are free to create.
`updated_at` is maintained by a shared `set_updated_at()` trigger. Indexes cover
city, cuisines (GIN), venue name (trigram), menu search (GIN `to_tsvector` over
name and description), price, place, and both wishlist user ids.

### DDL as applied to project `exujoxhylnyrvhmqqnhx`

```sql
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

create policy places_read     on public.places      for select to anon, authenticated using (true);
create policy menu_items_read on public.menu_items  for select to anon, authenticated using (true);
create policy reviews_read    on public.reviews     for select to anon, authenticated using (true);

create policy lists_own on public.wishlist_lists for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy items_own on public.wishlist_items for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy items_cap on public.wishlist_items for insert to authenticated
  with check ((select auth.uid()) = user_id
    and (select count(*) from public.wishlist_items wi
          where wi.user_id = (select auth.uid())) < 300);

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

create trigger places_touch before update on public.places
  for each row execute function public.set_updated_at();
create trigger lists_touch before update on public.wishlist_lists
  for each row execute function public.set_updated_at();
```
