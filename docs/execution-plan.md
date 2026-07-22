# Growth Execution Plan — phased tasks & ownership

Companion to [`growth-plan.md`](growth-plan.md) (the *why*) and
[`manual-setup-guide.md`](manual-setup-guide.md) (the manual *how-to*).
**Ads are deliberately last (Phase 4)** — we validate everything else first.

**Ownership legend:** 🧑‍💻 I build (code/content, on a branch) · ✋ you do manually (I guide) · 🤝 both

---

## Phase 0 — Deploy fixes + measurement foundation `← START HERE`
*Goal: corrected site live + measurement running. Nothing downstream matters until GSC exists.*

| # | Task | Owner | Notes |
|---|---|---|---|
| 0.1 | Merge #64 → `develop` → deploy | 🤝 | Pending branch-strategy decision below |
| 0.2 | Apply Dokploy edge config (HSTS / www→apex / HTTP→HTTPS) | ✋ | `deploy/dokploy-seo.md` |
| 0.3 | Search Console: verify domain + submit sitemap | ✋ | manual-setup §1 — **after deploy** |
| 0.4 | Bing Webmaster + IndexNow | ✋ | §2 |
| 0.5 | Confirm Plausible + organic segment | 🤝 | §5 |
| 0.6 | Populate `Organization.sameAs` | 🧑‍💻 | need your LinkedIn/X/Crunchbase URLs |
| 0.7 | Google Business Profile (Svasamm, Hooghly) | ✋ | §3 — decide public phone first |
| 0.8 | Claim 4–6 directories (G2/Capterra/SoftwareSuggest/TechJockey…) | ✋ | §4 — I supply the copy |

**Exit:** fixed site deployed · GSC + Bing receiving data · sitemap submitted · GBP + ≥2 directories live.

## Phase 1 — Capture pages (high-intent, winnable)
*Goal: build pages that convert demand you can actually rank for. No external accounts needed — I can start immediately.*

| # | Task | Owner | Notes |
|---|---|---|---|
| 1.1 | Competitor comparison pages (Practo Ray, Halemind, MocDoc, KareXpert, HealthPlix…) | 🧑‍💻 | new content collection + template; honest, no fabrication. Uses `/seo competitor-pages`. Highest-intent organic wins. |
| 1.2 | Regional landing pages: WB + Kolkata/Patna/Lucknow/Bhubaneswar/Ranchi | 🧑‍💻🤝 | genuinely localized (quality-gated, not doorways). You supply local specifics/proof. Uses `/seo local`. |
| 1.3 | Keyword research + map (validate volumes) | 🤝 | free tools + GSC data — **no ad account needed**. Uses `/seo cluster`. |

**Exit:** 5–7 competitor pages + ~5 regional pages live · keyword map documented.

## Phase 2 — Content clusters + authority
| # | Task | Owner | Notes |
|---|---|---|---|
| 2.1 | Topic clusters: ABDM, DPDP, Switching, Billing (pillar + spokes) | 🧑‍💻 | `/seo cluster`; I draft, you review facts. **All 4 clusters DONE** (PR #78): ABDM (pillar `abdm-abha-guide`), DPDP (`dpdp-for-clinics`), Switching (`switch-clinic-software-without-downtime`), Billing/GST (`gst-for-clinics`). 7 new posts + 6 existing tagged. |
| 2.2 | Internal-linking pass | 🧑‍💻 | pillars ↔ spokes ↔ product pages. **Auto** via `cluster:`/`pillar:` + "More in this series" (PR #78) — set the slug, links generate. |
| 2.3 | Backlink outreach (digital PR, guest posts, partnerships) | ✋🤝 | I prep pitch assets + target list; you send. **Kit ready:** [`backlink-kit.md`](backlink-kit.md) (PR #78). |
| 2.4 | Collect design-partner reviews | 🤝 | feeds directories + local proof |

**Exit:** 2 clusters live w/ internal linking · directory reviews flowing · ≥3 outreach pitches sent.

## Phase 2.5 — Cluster depth (breadth gap) `← IN PROGRESS`
The 4 base clusters shipped at pillar + 2 spokes. abdm was later deepened to 5. This phase brings
the rest to comparable depth and adds 2 net-new clusters for zero-coverage high-intent themes.
Voice = existing posts (HTML-authored, question-form H2s, vendor-neutral, YMYL-hedged, capability
framing on product claims, gov-source citations). **I draft → founder reviews facts locally → UAT.**
Auto-cross-link via `cluster:`/`pillar:` — add new cluster labels to `CLUSTER_LABELS` in `blog/[...slug].astro`.

| # | Cluster | State | New spokes | Owner |
|---|---|---|---|---|
| 2.5a | **billing** (deepen) | ✍️ drafted | pharmacy billing + GST (Schedule H/HSN/e-invoice), PMJAY & state schemes, room-rent sub-limits / short-payment, corporate-camp-credit billing. Dedup'd vs existing TPA + billing-stack posts. → 6 spokes | 🧑‍💻 |
| 2.5b | **nabh** (new) | ⬜ next | NABH entry-level for small hospitals (pillar), the metrics that matter (ALOS/infection/med-errors), audit-ready dashboards. Ties to hospitals page + PMJAY package-rate lever. Add `nabh` label. | 🧑‍💻 |
| 2.5c | **dpdp + switching** (deepen) | ⬜ queued | dpdp: retention/deletion, 72-hr breach runbook, WhatsApp-reminder consent. switching: from Tally/Marg pharmacy, competitor-specific migration (tie to /compare). → ~5 each | 🧑‍💻 |
| 2.5d | **engagement** (new) | ⬜ queued | no-shows & reminders (pillar, ties to ROI calc no-show value), waitlists/overbooking, recall for chronic patients. Add `engagement` label. | 🧑‍💻 |

**Order:** billing (done) → nabh → dpdp+switching → engagement. Each cluster is one review batch on its
own `content/*` branch; founder reviews locally before UAT. **Exit:** all 4 clusters ≥5 posts, new
clusters labelled + auto-linking, no fabricated product/metric claims.

## Phase 3 — Language + regional depth
| # | Task | Owner | Notes |
|---|---|---|---|
| 3.1 | Hindi content + `hreflang` | 🧑‍💻🤝 | you/translator provide translations; I wire hreflang |
| 3.2 | Expand regional + specialty depth | 🧑‍💻 | |
| 3.3 | Begin Bengali (WB), then Odia | 🤝 | |

**Exit:** Hindi live with correct hreflang · regional depth expanded.

## Phase 4 — ADS (LAST — only when confident)
*Prereq: measurement solid, converting pages live, budget decided.*
`/ads math` (unit economics) → `/ads plan` (media plan) → `/ads dna` + `/ads create` + `/ads generate` → launch → `/ads audit`.

---

## Branch strategy (decision needed)
- **Recommended:** merge #64 now; **one feature branch per phase** off `develop`, deploy as each completes. Lower risk, faster indexing, matches the husky `main→develop→feature` workflow.
- **Alternative (your first instinct):** stack all growth work on `seo-fixes`, one big merge+deploy at the end. Simpler mental model, but long-lived branch + giant PR + delayed SEO wins + GSC baselines the un-fixed site.

## Status
_Phase 0: not started · awaiting branch decision + your manual-setup items._
