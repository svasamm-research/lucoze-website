# Manual Setup Guide — the things only you can do

These require **your** logins / ownership / a credit card. I can't do them from code, but
each is a prerequisite for the growth work. Do them in order. `~30–90 min` total for the
must-haves (§1–§4). Ads accounts (§6) are **deferred to the end** — don't do them yet.

> **Do §1 only after the fixed site (PR #64) is deployed**, so Google baselines the corrected site.

---

## 1. Google Search Console (GSC) — the #1 free SEO tool  ⏱️ ~15 min
Shows exactly which keywords you're close to ranking for, indexing errors, and clicks/impressions.

1. Go to [search.google.com/search-console](https://search.google.com/search-console), sign in with the Google account you want to own this (use a **company** Google account, not personal, if possible).
2. Add property → choose **Domain** (`lucoze.com`) — this covers http/https + www + all subpaths.
3. It gives you a **DNS TXT record**. Add it at your **domain registrar / DNS provider** (wherever `lucoze.com` DNS is managed — likely your registrar or Dokploy's DNS). Wait a few minutes → click Verify.
4. Once verified: **Sitemaps** (left menu) → submit `sitemap-index.xml`.
5. **URL Inspection** → paste `https://lucoze.com/in/` → "Request indexing" (nudges a first crawl).
6. Reports to watch weekly: **Performance** (queries, clicks, impressions, avg position) and **Pages** (indexed vs not).

*Tell me once it's verified — I'll help you read the Performance report to pick keyword targets.*

## 2. Bing Webmaster Tools + IndexNow  ⏱️ ~10 min
Feeds Bing **and** ChatGPT search (which uses Bing's index) — matters for GEO.

1. [bing.com/webmasters](https://www.bing.com/webmasters) → sign in.
2. **Import from GSC** (one click, easiest) — or add + verify `lucoze.com` separately.
3. Submit `sitemap-index.xml`.
4. Enable **IndexNow** (Settings) — instant re-crawl pings when pages change. Your stack already references it; I can wire the key if you want push-on-deploy.

## 3. Google Business Profile (GBP)  ⏱️ ~20 min + postcard wait
Owns your brand SERP, can rank for "healthcare software company Kolkata/WB", collects reviews, feeds the AI entity graph.

1. [business.google.com](https://business.google.com) → **Add business**.
2. Name: **Lucoze** (or "Lucoze — Svasamm Research"). Category: **Software company**.
3. Address: the **Svasamm Research registered office (Hooghly, WB)**. If you don't want a public address, set it as a **service-area business** and hide the address.
4. **NAP must match the site exactly** — Name, Address, Phone identical to the footer / `security.txt`. (Decide one public phone number and use it everywhere.)
5. Verify (postcard/phone/email — Google chooses). Then fill: description, services, hours, photos, website `https://lucoze.com/in/`.

> ⚠️ Decide your canonical **public phone number** first — NAP consistency across GBP + site + directories is a real ranking factor. Tell me the number and I'll add it to the site + `security.txt`.

## 4. SaaS + local directory listings  ⏱️ ~10 min each, do 4–6
Double win: **backlink** + you appear in the "best HMS India" listicles that own the head terms you can't rank for yet.

Priority (SaaS): **[G2](https://www.g2.com), [Capterra](https://www.capterra.in), [GetApp](https://www.getapp.com), [SoftwareSuggest](https://www.softwaresuggest.com), [TechJockey](https://www.techjockey.com), [Techimply](https://www.techimply.com)**.
Local (India): **Justdial, Sulekha, IndiaMART**.

For each: create/claim the listing → use the **exact same NAP + description + logo** → link to `https://lucoze.com/in/` → then ask design-partner clinics to leave reviews.

*I'll give you a copy-paste company description + the categories to select so all listings are consistent.*

## 5. Confirm analytics  ⏱️ ~5 min
You run **Plausible** (`analytics.lucoze.com`). Confirm it's recording, and that you can segment **organic vs paid vs direct** traffic. If it's not live, tell me — it's wired via `PUBLIC_PLAUSIBLE_DOMAIN` env.

## 6. Ad accounts — DEFERRED (do NOT set up yet)
Google Ads / Meta Business accounts come **after** Phase 0–3 and after we run `/ads math`. Listed here only so you know they're coming. Skip for now.

---

### What I need back from you to unblock code work
- Your **LinkedIn / X / Crunchbase** URLs → I populate `Organization.sameAs`.
- The **canonical public phone number** → NAP consistency (site + `security.txt`).
- A green light on the branch strategy (see the execution plan).
