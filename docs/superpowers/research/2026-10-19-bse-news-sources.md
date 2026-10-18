# BSE news source feasibility probe — 2026-10-19

Probed from this machine (macOS, local dev, curl with browser UA + BSE cookies).

## BSE-official endpoints: all closed

| Target | Result |
| --- | --- |
| `api.bseindia.com/BseIndiaAPI/api/getCategoryWiseNews/w` | 403 Akamai "Access Denied" |
| `api.bseindia.com/BseIndiaAPI/api/GetHomeMarketData/w` | 403 Akamai |
| `api.bseindia.com/common/Master/BSEMaster.zip` (token bootstrap) | 403 |
| `data.bseindia.com/v4p1/GetNews.php`, `GetCompanyAnn.php` | connect failed (000, no route/DNS from this host) |
| `www.bseindia.com/press-release/PressReleases.aspx` | 301 → `/press-release/PressReleases` → 200 but a 14 KB JS SPA shell, no server-rendered items |
| `www.bseindia.com/api/...`, `/MarkupFiles/GeneralNews.json` | 200 but the same SPA shell HTML, not JSON |

www.bseindia.com HTML contains only one API reference: `https://api.bseindia.com`, which is the host that 403s. So the
exchange's own news/announcement JSON is behind Akamai bot protection; a cookie from the homepage does not clear it.
A server-side fetch from the deployment would very likely hit the same rule (datacenter IP is usually stricter than
residential). Unverified from this machine.

## Working live sources

| Source | Result | Notes |
| --- | --- | --- |
| Google News RSS `q="Bombay Stock Exchange" OR Sensex when:2d` | 200, 48 items | Fresh, clean headlines from ET/TOI/Mid-Day etc. Reuses the existing `fetchRss` pipeline |
| Google News RSS `q=site:bseindia.com when:30d` | 200, 100 items | These ARE BSE's own published documents, but Google indexes them from PDFs and titles are OCR-garbled (`;1~L-- - BSE`, `MONICA g2y - BSE`). Unusable as a demo wire |
| `livemint.com/rss/markets` | 200, 35 items | Direct publisher feed, no Google in the middle |
| `economictimes.indiatimes.com/rssfeedstopstories.cms` | 200, 53 items | Direct publisher feed (desktop host; the `m.` host and `topnews.cms` returned 0 items) |
| `business-standard.com/rss/markets-105.xml` | 0 items | Not usable as probed |
| `moneycontrol.com/rss/...` | 403 Akamai | Blocked |

## Consequence for the design

"No BSE official feed without a key or a proxy" is the constraint. Any BSE tab has to be built from a source that
answers today: Google News keyword query, or a direct publisher markets feed, or a paid/registered aggregator.