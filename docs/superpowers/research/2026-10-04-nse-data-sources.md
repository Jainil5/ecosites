# NSE Data Sources — Feasibility Research (2026-10-04)

Empirical probing of free / keyless / free-tier sources for (a) the full NSE equity
universe (~2000 symbols) and (b) per-symbol fundamentals: market cap, P/E, P/B, EPS,
dividend yield, sector/industry. All requests below were run from this machine's server-side
curl. No application code was written and no repo file was modified except this doc.

## Verdict

- **Universe (~2000 symbols):** NSE `archives.nseindia.com/content/equities/EQUITY_L.csv`
  is the canonical free universe list. (Status of plain-curl fetch confirmed below.) It has
  SYMBOL / NAME / SERIES / ISIN but **NO fundamentals** — universe only.
- **Per-symbol fundamentals at scale:** Yahoo `v7/finance/quote` via the crumb+cookie flow is
  the only free source tested that returns marketCap, trailingPE, priceToBook,
  epsTrailingTwelveMonths and dividendYield, and it is **batchable** (many symbols per GET).
- **Sector/industry gap:** `v7/finance/quote` does **NOT** return `sector`/`industry`. Those
  live only in `v10/finance/quoteSummary` `assetProfile`, which is **one symbol per request**
  → ~2000 calls for sector. (Details + commands in `## Working requests`.)
- **Recommended single recipe:** EQUITY_L.csv for the universe → batched Yahoo `v7 quote`
  (crumb flow) for mcap/PE/PB/EPS/DY → per-symbol Yahoo `quoteSummary?modules=assetProfile`
  for sector, cached aggressively since sector is effectively static.

## Working requests

### 1. Yahoo Finance — v7 quote via crumb+cookie handshake (CONFIRMED WORKING)

The plain `v7/finance/quote` call with only a User-Agent returns **401 "User is unable to
access this feature"**. It needs a cookie + `crumb`. The full flow that worked from curl:

```bash
# UA MUST be the short "Mozilla/5.0" (long Chrome UAs get 429 per prior project finding)
JAR=/tmp/yh.txt

# (1) Seed cookies. fc.yahoo.com returns HTTP 404 but DOES Set-Cookie: A3=...
curl -sS -c $JAR -o /dev/null -H "User-Agent: Mozilla/5.0" "https://fc.yahoo.com"

# (2) Fetch crumb using the cookie jar.
CRUMB=$(curl -sS -b $JAR -c $JAR -H "User-Agent: Mozilla/5.0" \
  "https://query1.finance.yahoo.com/v1/test/getcrumb")   # e.g. 2BveeVkyp.D

# (3) Batched quote call with crumb.
curl -sS -b $JAR -H "User-Agent: Mozilla/5.0" \
  "https://query1.finance.yahoo.com/v7/finance/quote?symbols=RELIANCE.NS,TCS.NS,INFY.NS&crumb=${CRUMB}"
```

Result: HTTP 200, `quoteResponse.result[]` one object per symbol. Fields returned (verified
on RELIANCE.NS / TCS.NS / INFY.NS):

```
symbol, longName, shortName, currency:"INR", exchange:"NSI", fullExchangeName:"NSE",
regularMarketPrice, marketCap (INR),          e.g. RELIANCE marketCap 15801867304960
trailingPE,                                    e.g. RELIANCE 21.14, TCS 15.08, INFY 13.30
priceToBook,                                   e.g. RELIANCE 1.75,  TCS 6.85,  INFY 4.54
bookValue, sharesOutstanding,
epsTrailingTwelveMonths,                       e.g. RELIANCE 55.23, TCS 137.57
epsForward, forwardPE, dividendYield (%),      e.g. RELIANCE dy 0.51, TCS 3.13, INFY 4.83
dividendRate, regularMarketVolume, fiftyTwoWeekHigh/Low, marketState
```

Mapping to the repo's `StockMeta`: mcapCr = `marketCap/1e7`, pe = `trailingPE`,
pb = `priceToBook`, eps = `epsTrailingTwelveMonths`, dy = `dividendYield`,
name = `longName`. **`sector` is NOT provided here** (see quoteSummary below).

No ENTERPRISEVALUES field on v7 quote; `priceToBook` equivalent IS present.

### 2. Yahoo Finance — v10 quoteSummary assetProfile (sector/industry; one symbol per call)

```bash
curl -sS -b $JAR -H "User-Agent: Mozilla/5.0" \
  "https://query1.finance.yahoo.com/v10/finance/quoteSummary/RELIANCE.NS?modules=assetProfile,financialData,defaultKeyStatistics&crumb=${CRUMB}"
```

HTTP 200. `assetProfile` returns: `sector:"Energy"`, `sectorKey:"energy"`,
`sectorDisp:"Energy"`, `industry:"Oil & Gas Refining & Marketing"`, `industryKey`,
`industryDisp`, `longBusinessSummary`, `fullTimeEmployees`, address/website.
**Path is per-symbol (no batching)** → to cover the whole universe you need ~2000 requests
for sector alone. Sector rarely changes → cache it.

`quoteSummary` **also requires the crumb**: `GET …/quoteSummary/TCS.NS?modules=assetProfile`
with no `crumb` → **HTTP 401 "Invalid Crumb"**. Burst test of 12 per-symbol quoteSummary
calls at 1 req/s → 12/12 HTTP 200, 12/12 carried a non-empty `sector`.

### Observed batching cap + rate limits (Yahoo v7 quote)

- **Per-request response cap ≈ 157 symbols.** Requests of 130 → 130 rows, 157 → 157, but
  180 / 250 / 500 / 1000 all clamp to exactly **157** rows (Yahoo silently truncates). Safe
  batch size: **150**.
- **Full universe sweep (fundamentals) is trivial:** 2000 EQ symbols in batches of 150 =
  **14 HTTP calls**, all HTTP 200, **zero 429s** at 1 req/s, ~**23s** wall clock. (It returned
  1468 rows, not 2000 — a chunk of EQUITY_L.csv symbols are delisted/renamed/not on Yahoo,
  so realistic Yahoo coverage of the CSV is ~70–75%.)
- The single seeded cookie+crumb survived the entire 14-call sweep without refresh (session-
  durable for a nightly job). Re-seed anyway if 401 reappears.
- Consistent with the prior project note: keep UA exactly `Mozilla/5.0`, keep inter-request
  spacing ≥ ~1s to avoid intermittent 429 under burst.

### 3. NSE archives — EQUITY_L.csv (universe source; plain curl WORKS, no auth)

```bash
curl -sS -o EQUITY_L.csv -H "User-Agent: Mozilla/5.0" \
  "https://archives.nseindia.com/content/equities/EQUITY_L.csv"
```

HTTP 200, ~183 KB. **2593 data rows** (symbols). Exact columns:
`SYMBOL, NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE, MARKET LOT, ISIN NUMBER, FACE VALUE`.

Sample:
```
20MICRONS,20 Microns Limited,EQ,06-OCT-2008,5,1,INE144J01027,5
360ONE,360 ONE WAM LIMITED,EQ,19-SEP-2019,1,1,INE466L01038,1
3IINFOLTD,3i Infotech Limited,BE,22-OCT-2021,10,1,INE748C01038,10
```

- Contains SYMBOL + NAME (maps to repo `symbol` with `.NS` appended, and `name`).
- **Contains NO market cap, NO P/E, NO price-to-book, NO EPS, NO dividend yield, NO
  sector/industry.** Confirmed: header grep for "market cap"/"price earning"/"P/E" → nothing.
  This is a universe/name/ISIN list only.
- `SERIES` includes EQ, BE (bad/emerging), etc. — filter to `EQ` for a clean investable
  universe (~2000 symbols).
- The `archives.nseindia.com` subdomain is NOT bot-guarded, unlike `www.nseindia.com` (below).
- **No single free NSE endpoint gives per-symbol fundamentals for the whole universe** — the
  dynamic APIs that would (equity-stockIndices carries PE only, and the stock-info API) are
  bot-guarded from curl (see dead ends).

## Confirmed dead ends

### Yahoo v7 quote with only a User-Agent (no cookie/crumb)
```
GET https://query1.finance.yahoo.com/v7/finance/quote?symbols=RELIANCE.NS,TCS.NS   UA: Mozilla/5.0
HTTP 401
{"finance":{"result":null,"error":{"code":"Unauthorized","description":"User is unable to access this feature - https://bit.ly/yahoo-finance-api-feedback"}}}
```
Fix: use the crumb+cookie flow above.

### Yahoo getcrumb without a seeded cookie
```
GET https://query1.finance.yahoo.com/v1/test/getcrumb   (empty cookie jar)
HTTP 401
{"finance":{"result":null,"error":{"code":"Unauthorized","description":"Invalid Cookie"}}}
```
Same on query2. Must seed a cookie first (fc.yahoo.com 404 still Set-Cookie: A3, or the
finance.yahoo.com/quote HTML page sets A1/A3/A1S).

### fc.yahoo.com body is empty
`GET https://fc.yahoo.com` → **HTTP 404**, empty body, BUT it sets the `A3` cookie needed by
getcrumb. So "404" here is not a failure — treat it purely as a cookie seed.

### Yahoo v7 quote has no sector/industry
Grepping `v7/finance/quote` JSON for `"sector"`/`"industry"` returns nothing on NSE symbols.
Sector must come from `quoteSummary` (per-symbol).

### Yahoo v8 chart `meta` has no fundamentals (marketCap/sector)
The already-used price endpoint `GET /v8/finance/chart/RELIANCE.NS?range=1y&interval=1d`
(UA `Mozilla/5.0`) → HTTP 200, but its `meta` object exposes only price/venue fields
(`symbol, currency, exchangeName, regularMarketPrice, fiftyTwoWeekHigh/Low, longName,
regularMarketVolume, …`). **`marketCap` present? False. `sector` present? False.** So the
existing chart endpoint cannot supply fundamentals; it stays useful only for the price series.

### NSE www API — equity-stockIndices (bot-guarded)
```
GET https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050
UA: Mozilla/5.0                         -> HTTP 404  "Resource not found"
UA: full Chrome + Referer + cookie jar  -> homepage GET returns HTTP 403, no cookies set;
                                            API call still HTTP 404
```
Error body (both cases) is the Akamai bot-manager interstitial:
`<title>Resource not found</title> … <script src="/2W1U65V42hZpBQpVCA/…/i7GuhfGfLbGXJw7b/…">`.
Plain curl — and even a full browser-header + seeded-cookie attempt — is blocked from a
server-side client. Not usable without a real browser/JS execution.

### NSE www API — online-equities (bot-guarded)
```
GET https://www.nseindia.com/api/online-equities?series=A&pageSize=20&pageNumber=1
UA: Mozilla/5.0  -> HTTP 404  (same Akamai "Resource not found" interstitial)
```

### StockTwits — Cloudflare challenge, and wrong data type anyway
```
GET https://api.stocktwits.com/api/2/streams/symbol/RELIANCE.NS.json   UA: Mozilla/5.0
-> HTTP 200 but body is a Cloudflare "Just a moment…" challenge page
   (<title>Just a moment…</title> … challenges.cloudflare.com), not JSON.
```
Blocked keyless via curl. Separately, `/streams/symbol/` returns **social messages**, not
fundamentals — it would not supply marketCap/PE/PB/EPS/DY/sector even if it did respond.
**Not useful for this purpose.**

### screener.in — no keyless JSON API (HTML only → scraping)
```
GET https://www.screener.in/api/company/RELIANCE/                     -> HTTP 404 "Error 404: Page Not Found - Screener"
GET https://www.screener.in/api/company/RELIANCE/results/             -> HTTP 404
GET https://www.screener.in/api/company/RELIANCE/quarters/            -> HTTP 404
GET https://www.screener.in/api/company/consolidated/RELIANCE/        -> HTTP 404
```
There is **no sanctioned public JSON API** for a company's fundamentals. The human HTML page
`GET https://www.screener.in/company/RELIANCE/consolidated/` returns **HTTP 200** and its
body does contain the values the repo needs (Market Cap, Current Price, P/E, Price to Book,
Dividend Yield, and Industry e.g. "Petroleum Products"). But reaching them requires parsing
HTML = **scraping, not an API.** robots.txt (UA `*`) does not disallow `/company/*` (only
`/user/*`, `?q=/sort/limit/page` query strings, and `/company/source/quarter/*`), yet bulk
per-symbol HTML scraping is not a ToS-blessed data source and is fragile. Treat screener.in
as a last-resort scraper, not the primary feed.

## Nightly sync math

Universe = 2000 EQ symbols (from EQUITY_L.csv). "Fundamentals" = marketCap, trailingPE,
priceToBook, epsTrailingTwelveMonths, dividendYield (all in ONE batched Yahoo v7 call set);
"sector/industry" = separate per-symbol Yahoo quoteSummary (no batch path exists).

**A. Fundamentals via batched `v7/finance/quote` (mcap/PE/PB/EPS/DY):**
- Batches of 150 → `ceil(2000 / 150) = 14` HTTP calls.
- Measured: 14 calls, all HTTP 200, 0×429 at 1 req/s, **~23 s wall clock.**
- Nightly: ~14 requests, under a minute. **Comfortably feasible for a free source.**

**B. Sector/industry via per-symbol `v10/quoteSummary` (1 req / symbol):**
- ~1468 Yahoo-valid symbols → ~1468 requests. At 1 req/s ≈ **24 min**; at a safer 2 s/symbol
  ≈ 49 min. Fast bursts of this many single calls raise 429 risk.
- Sector is near-static → **cache it.** Fetch once on cold start; nightly refresh only the
  handful of newly-listed symbols not yet cached (typically 0–10/day).

**Combined nightly job (recommended):**
1. `EQUITY_L.csv` → 1 request (universe diff).
2. Batched `v7/quote` for ALL symbols → ~14 requests (refresh every fundamental nightly).
3. `quoteSummary?modules=assetProfile` → **only symbols missing from the sector cache**
   (steady-state ~0–10/day; cold-start ~1468 once).
- Steady-state nightly total ≈ **15–25 requests, well under a minute.**

**Verdict on feasibility:** YES for fundamentals — one free source (Yahoo v7 batched) refreshes
all 2000 symbols' mcap/PE/PB/EPS/divyield nightly in ~14 calls. The ONLY thing that does not
scale free/keyless is **sector/industry** (per-symbol), which is solved by caching rather than
nightly re-pull. No free source delivers sector for the whole universe in a single call.

## Docs-only (untested)

No API keys were available, so these are documentation/policy findings, **not** live-tested.
Free-tier limits and India coverage were read off each vendor's own pages (fetched via curl).

| Provider | Indian (NSE) equities? | Fundamentals (mcap/PE/PB/EPS/DY/sector) on FREE tier? | Free-tier limit (quoted) | Nightly 2000-symbol fit |
|---|---|---|---|---|
| **Alpha Vantage** | Yes, but global incl. India is not the free dataset | `OVERVIEW`/fundamentals exist; India sits under paid/global | *"free stock API service covering the majority of our datasets for **25 API requests per day**"* | **NO** — 25/day vs 2000 symbols |
| **Finnhub** | Indian exchanges `["NS","BO"]` in coverage, but under the **Global** (paid) product | Basic Financials `/stock/metric?metric=all` tagged `free` for **US**; *"global company fundamentals …"* is premium | ~60 calls/min free (US endpoints); India = paid plan | **India fundamentals effectively paid** |
| **Twelve Data** | Exchange `XNSE` listed | Fundamental Data is a separate paid add-on | *"8 requests per minute limit"*, **800 credits/day** free | 800/day < 2000 → **cannot** refresh universe daily |
| **EODHD** | NSE EOD/fundamentals on paid plans | Fundamentals gated; *"Some data types are not accessible on the free plan"* | **20 free API calls per day** | **NO** — 20/day ~100× short |
| **Polygon.io** | **No** — pricing has zero India/NSE/BSE/non-US-equity coverage | n/a (US/indices/FX/crypto) | free tier ~5 calls/min (US) | **NO** — no Indian equities |

Takeaways: every keyless-free or free-tier alternative is **worse than the Yahoo crumb flow**
for this job. Alpha Vantage (25/day) and EODHD (20/day) cannot touch 2000 symbols nightly;
Twelve Data fundamentals + Finnhub India sit behind paid plans; Polygon has no India equities.
Yahoo remains the only free path that batch-serves all fundamentals.

## Sources

Empirically probed (this session, server-side curl):
- Yahoo Finance v7 quote / v1 test getcrumb / v10 quoteSummary / v8 chart — `query1.finance.yahoo.com`
- NSE archives universe CSV — https://archives.nseindia.com/content/equities/EQUITY_L.csv
- NSE live APIs (bot-guarded) — https://www.nseindia.com/api/equity-stockIndices , /api/online-equities
- StockTwits (Cloudflare-blocked) — https://api.stocktwits.com/api/2/streams/symbol/RELIANCE.NS.json
- Screener.in (HTML only, no JSON API) — https://www.screener.in/company/RELIANCE/consolidated/ , robots.txt

Docs consulted (untested, no keys):
- [Alpha Vantage — get API key / free 25 requests per day](https://www.alphavantage.co/support/#api-key)
- [Alpha Vantage — premium request-per-day tiers](https://www.alphavantage.co/premium/)
- [Alpha Vantage — API documentation](https://www.alphavantage.co/documentation/)
- [Finnhub — Company Basic Financials endpoint](https://finnhub.io/docs/api/company-basic-financials)
- [Finnhub — pricing / global fundamentals](https://finnhub.io/pricing)
- [Twelve Data — pricing (8 req/min, 800 credits/day free)](https://twelvedata.com/pricing)
- [Twelve Data — Fundamental Data API](https://twelvedata.com/fundamentals)
- [Twelve Data — NSE (XNSE) exchange page](https://twelvedata.com/exchanges/xnse)
- [EODHD — pricing (20 free API calls/day)](https://eodhd.com/pricing)
- [Polygon.io — pricing (no India coverage)](https://polygon.io/pricing)
