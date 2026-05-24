# Portfolio Holdings Dashboard

A small demo app inspired by **VerrCloud Bond Navigator**. It lets you manage a simple stock portfolio: add positions, see current value, and watch **profit or loss** update as prices change (simulated, not real market data).

**What you get**

- A **website** you open in the browser (table, add form, summary totals)
- A **server** that stores data, updates prices, and does the math
- A **database file** on disk so data survives restarts

**Built with:** C#/.NET (server), React (website), SQLite (storage). AI tools (Cursor) were used during development — see [AI Usage Log](#3-ai-usage-log) below.

---

## What you need installed

| Software | Why |
|----------|-----|
| [.NET 8 SDK](https://dotnet.microsoft.com/download) | Runs the server |
| [Node.js 18+](https://nodejs.org/) | Runs the website in dev mode |

---

## 1. Setup & Run (under 5 minutes)

### Step 1 — Get the code

```bash
git clone https://github.com/Ovais314/verracloud-takehome-ovais.git
cd verracloud-takehome-ovais
```

### Step 2 — Start the server (first terminal)

```bash
cd PortfolioApi
dotnet restore
dotnet run --launch-profile http
```

Leave this window open. The first time it runs, it will:

- Create a local database file (`portfolio.db`)
- Load sample prices for **AAPL, MSFT, JPM, T, GS**
- Update those prices automatically every **10 seconds**

**Server address:** http://localhost:5205  
**API docs (optional):** http://localhost:5205/swagger

### Step 3 — Start the website (second terminal)

```bash
cd portfolio-dashboard
npm install
npm run dev
```

Leave this open too. Then open in your browser:

**http://localhost:5173**

### Step 4 — Try it

1. Add a holding — e.g. ticker **AAPL**, quantity **10**, purchase price **170**
2. Check the **summary bar** (total value, total P&L, number of positions)
3. Confirm the **Live** badge is green, then watch P&L update when prices change (about every 10 seconds) — no manual refresh needed

**Supported tickers for new holdings:** AAPL, MSFT, JPM, T, GS (the ones seeded at startup).

### If something does not load

- Make sure the **server** (step 2) is running before the website
- Use `dotnet run --launch-profile http` (not only `dotnet run` with HTTPS) so the browser and server talk on the same setup
- Restart both terminals after pulling new code

---

## 2. Architecture Overview

Think of three parts working together:

```
  Browser (website)          Server (API)              Database (file)
  ----------------          -------------              ----------------
  Table, form, summary  -->  Saves holdings      -->   portfolio.db
  Live link (SignalR)       Updates prices every 10s
  Server pushes updates     Calculates P&L, pushes new totals to all browsers
```

### Website (`portfolio-dashboard`)

| Part | What it does |
|------|----------------|
| **Holdings table** | Lists each position; green/red for profit or loss; delete button |
| **Add form** | Adds a new position; checks your input before sending |
| **Summary bar** | Total market value, total P&L, how many positions you have |
| **Live updates** | Stays connected with **SignalR**; server **pushes** new holdings when prices or positions change |
| **Live badge** | Shows Connected / Reconnecting / Offline |
| **Table controls** | Search by ticker, filter by profit/loss, sort columns, paginate (5 / 10 / 25 per page) |

### Server (`PortfolioApi`)

| Part | What it does |
|------|----------------|
| **API** | Answers requests: list holdings, add, delete, get prices |
| **Business rules** | No duplicate ticker; quantity and price must be positive; P&L = (current price − what you paid) × quantity |
| **Price simulator** | Every **10 seconds**, nudges each stock price up or down by up to about 2% |
| **Real-time hub** | After prices change (or you add/delete), broadcasts fresh holdings to every open browser |
| **Database** | Two tables: **Holdings** (what you own) and **Prices** (latest simulated price per ticker) |

### Main API actions (for reference)

| Action | What it means |
|--------|----------------|
| List holdings | Everything you own, with current price and P&L |
| Add holding | New row: ticker, how many shares, purchase price |
| Delete holding | Remove one position by id |
| List prices | Current simulated prices for all tickers |
| Refresh prices | Manually bump prices (also happens automatically every 10s) |

### Folders in this repo

```
PortfolioApi/           → Server code
portfolio-dashboard/    → Website code
```

---

## 3. AI Usage Log

This project **used AI on purpose** (Cursor), as required by the take-home. Below is what worked, what did not, and how the code was still reviewed by hand.

### Tools used

- **Cursor** — main helper for server, website, and fixes

### Examples where AI helped

1. **Server layout** — AI drafted the split between “web layer,” “business logic,” and “database access,” plus the first version of holdings and prices code. I checked the P&L formula and rules (e.g. one row per ticker, only seeded tickers allowed).

2. **Website** — AI built the React screen (table, form, summary). Later replaced **5-second polling** with **SignalR** so the server pushes updates when prices change (closer to how real trading dashboards work).

3. **Checklist against requirements** — AI compared the project to the spec (10s price updates, five seed stocks, validation messages). Missing pieces were added in the same pass.

### Example where AI was wrong — and how we fixed it

**Problem:** The website could not load data. The browser tried `http://localhost:5205`, the server redirected to `https://localhost:7018`, and the browser blocked the response for security reasons (CORS).

**Why AI’s first fixes were not enough:** Adding “allow browser access” settings alone did not fix the redirect to a different address.

**What actually worked:** Run the server on plain **http** port 5205, stop forcing HTTPS in local dev, and let the website talk through its built-in **proxy** so everything stays on one address during development.

**Lesson:** Run the app after every “fix” and look at the browser network tab — do not trust a plausible-sounding answer without testing.

### How we use AI responsibly

- Treat suggestions as a **first draft**
- Read changes and run the server + website locally
- Keep final say on structure and behavior

---

## 4. Design Decisions

### Why is the server split into layers?

So each job has one home: the web layer handles requests, the middle layer holds rules and math, the data layer talks to the database. That makes the code easier to test, change, and explain — the same pattern used on larger products.

### How would this handle 10,000 users at once?

Rough plan:

1. **Bigger database** — SQLite is fine for a demo; real load needs PostgreSQL or similar, with room to grow and backup.
2. **More than one server** — Run several copies behind a load balancer so no single machine does all the work.
3. **One price updater** — Only one background job should change prices, not every server copy.
4. **Faster reads** — Cache latest prices in memory (e.g. Redis) so listing holdings does not hammer the database.
5. **Scale SignalR** — Use **Azure SignalR Service** or Redis backplane so many API servers share one real-time layer; host the static website on a CDN.
6. **Security and limits** — Login, HTTPS, rate limits, monitoring.

The first pain points at huge scale would be the small database file and every server trying to update prices at once.

### What would you do with 2 more hours?

Add **automated tests** for P&L math and holdings CRUD, plus **server-side paging** (`GET /api/holdings?page=&pageSize=&ticker=&pnl=`) once portfolios grow past a few dozen rows — client-side filter/page is fine for the demo, but production loads should not ship entire portfolios on every SignalR push.

### Holdings table: filter & pagination (production note)

The table filters and pages **in the browser** on the data you already have. That keeps SignalR simple (one broadcast, UI stays snappy for small lists). For large portfolios, filters would move to the API and live updates would trigger a **refetch** with the current query, not a full dump every 10 seconds.

---

## For developers (short technical notes)

| Topic | Detail |
|-------|--------|
| Server stack | .NET 8, ASP.NET Core, EF Core, SQLite, FluentValidation, Serilog, Swagger |
| Website stack | React 19, Vite, Redux Toolkit, RTK Query, `@microsoft/signalr` |
| Real-time | Hub `/hubs/portfolio`, event `HoldingsUpdated`; Vite proxies `/hubs` with WebSockets |
| Table UX | `useHoldingsTableControls` — client filter/sort/page; see hook comment for server-side scale-up |
| P&L | `(currentPrice - purchasePrice) × quantity` on the server |
| Dev proxy | `/api` and `/hubs` → `http://localhost:5205` (`portfolio-dashboard/vite.config.js`) |
| Reset database | Stop server, delete `PortfolioApi/portfolio.db`, run again |

---

## License

Take-home submission — see repository owner for usage terms.
