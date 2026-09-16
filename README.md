<div align="center">

# 📈 GitHub Trending Dashboard

**Scrape → score → surface. A complete data pipeline with a frontend on the end of it.**

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

---

## What it is

GitHub's trending page tells you what got stars today. It doesn't tell you what's *accelerating*.

This dashboard scrapes the daily trending page, computes a custom **Hype Score**, and renders
an interactive leaderboard you can sort, scan and clone from — in one click.

```
GitHub /trending  →  BeautifulSoup  →  Pandas  →  data.csv  →  Next.js leaderboard
```

## The Hype Score

```python
hype_score = int(stars_today * 1.25)
```

Deliberately simple and deliberately transparent: a 125% weighting on raw daily star growth,
computed at parse time so the frontend never has to trust a stale number. The score is
written into the dataset alongside the raw count, so you can always see what it was derived
from.

## How it works

**Python side** — `fetch_repos.py` requests the trending page with a real browser
`User-Agent`, parses each `article.Box-row` with BeautifulSoup, and extracts repo name,
description and stars-gained-today (handling the comma formatting and the missing-element
case). Pandas writes the result to `public/data.csv` and the script emits a structured JSON
summary to stdout — repos found, top repo, top score, timestamp — so it's callable from
anything.

**Next.js side** — a **Server Action** (`src/app/actions.ts`) shells out to the Python script,
then calls `revalidatePath('/')`, so hitting *Sync* refreshes the data server-side with no
client-side refetch dance. `RepoTable.tsx` parses the CSV with PapaParse and renders a sorted,
animated leaderboard. A second Server Action clones any repo straight to disk.

## Layout

```
fetch_repos.py            # scraper + Hype Score + CSV export + JSON summary
requirements.txt
public/data.csv           # the generated dataset
src/app/actions.ts        # Server Actions: syncGithubData(), cloneRepo()
src/app/page.tsx          # dashboard shell
src/components/RepoTable.tsx   # sortable animated leaderboard
src/types/papaparse.d.ts
```

## Running it

```bash
# 1 · scraper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python fetch_repos.py          # writes public/data.csv

# 2 · dashboard
npm install
npm run dev                    # http://localhost:3000
```

> **Note:** `fetch_repos.py` and `actions.ts` currently resolve paths against a hardcoded
> local directory. Point them at your own checkout (or set them relative to the repo root)
> before running.

## Stack

`Python` · `requests` · `BeautifulSoup` · `Pandas` · `Next.js 16` · `React 19` · `TypeScript`
· `Server Actions` · `PapaParse` · `Framer Motion` · `Tailwind v4`

---

<div align="center">
Built by <a href="https://github.com/dhruv9097">Dhruv Singh</a>
</div>
