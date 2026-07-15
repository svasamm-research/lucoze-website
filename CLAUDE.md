# CLAUDE.md — lucoze-website

Marketing site for **Lucoze** (healthcare management software for Indian clinics/hospitals). Canonical: `https://lucoze.com`. Built by **Svasamm Research Pvt. Ltd.**

## Stack
- **Astro** (`output: static`), React islands, MDX. Build → `dist/`, served by **nginx** (`nginx.conf`) in Docker.
- Content lives in **content collections** (`src/content.config.ts`):
  - `blog/*.mdx` — posts (frontmatter: title, dek, category, **author**, date, readMins, composite, draft).
  - `features/*.json` — product feature pages (stats, rows, faqs).
  - `specialties/*.json` — specialty pages (why, plan, price, **dashSpecialty**, **detail**, **faqs**).
  - `locations/*.json` — local/regional landing pages at `/in/locations/[slug]/` (kind state|city, intro, points, localContext, citiesServed, faqs). Keep 60%+ unique per page (quality gate); footer "Locations" nav links them.
- Only region shipped is **`/in/`** (`en_IN`); `/`, `/ae`, `/au`, `/sg` redirect to `/in/` via `astro.config.mjs`. Hindi/Bengali/Odia i18n is planned (add hreflang when a 2nd language ships).

## Git workflow (enforced by husky)
- **`main` → `develop` → feature branches.** Branch feature work off **`develop`**.
- `pre-commit` **blocks direct commits to `main`/`develop`** and runs `prettier --check` on js/css/html.
- Commits must be **Conventional Commits** (`commitlint`): `feat(...)`, `fix(...)`, `chore(...)`. Merge/Promote commits are ignored.
- `pre-push` runs `jest` + a **Docker build check** (needs the Docker daemon; if it's off, the push blocks — verify build/tests manually and use `--no-verify` knowingly).
- Indentation is **tabs** (prettier). When an `Edit` fails on leading-tab mismatch, match on a unique inner substring instead.

## Build / test / verify
- `npm run build` (astro) · `npm test` (jest) · `npm run dev` (localhost:4321).
- After content/schema changes, **build and grep `dist/`** to confirm rendered JSON-LD (e.g. `grep -oE '"@type":"[A-Za-z]+"' dist/in/.../index.html | sort | uniq -c`).

## SEO / schema conventions (non-obvious)
- **Sitewide** `Organization` (legalName = Svasamm Research Pvt. Ltd., founder = Mithun K. Singh, `sameAs`) + `WebSite` JSON-LD are emitted from **`src/layouts/Base.astro`** — do **not** re-add Organization per page.
- **`Crumbs.astro` already emits `BreadcrumbList`** — do not add a second one on feature/specialty pages (they only add `FAQPage` / `Service`).
- Page-specific schema goes through `<slot name="head">`.
- Legal entity everywhere = **Svasamm Research Pvt. Ltd.** Sales email **hello@lucoze.com**, founder **mithun@lucoze.com**.
- FAQ rich results were retired by Google (May 2026); keep `FAQPage` for **AI/LLM citation**, not SERP snippets. Never recommend `HowTo`.
- Don't invent metrics/customer counts (pre-launch, design-partner stage). Reframe unsourced numbers as honest capability/target claims. Verify product features against the Frappe source (see the `reference-product-benches` memory).

## Deploy (Dokploy / Traefik)
- App nginx listens on **`:80` only** — TLS terminates upstream at **Dokploy/Traefik**.
- **Prod runs on a Dokploy *remote server*; public DNS (GoDaddy) for `lucoze.com` + `www` points *directly* at that server** — not the manager VPS (which only hosts `manager.lucoze.com` + UAT routing). Don't route the prod domain through the manager.
- Release flow: `develop → uat → main`; production builds from **`main`**.
- **Only HTTP→HTTPS + TLS/domain provisioning are at the Dokploy/Traefik edge.** **www→apex 301, HSTS, apex `/`→`/in/` 301, and `absolute_redirect off` all live in `nginx.conf`** (ship with the image). Traefik-middleware labels for www/HSTS proved unreliable in Dokploy (router-name mismatch) — don't use them; see `deploy/dokploy-seo.md`.
- HSTS is host-only for now; upgrade to `includeSubDomains` then `preload` only once every `*.lucoze.com` is confirmed HTTPS.

## Growth
- Strategy (the *why*): **`docs/growth-plan.md`**. Update; don't duplicate.
- Phased task tracker + ownership (the *what/when*): **`docs/execution-plan.md`**.
- Manual setup for the user (GSC/Bing/GBP/directories): **`docs/manual-setup-guide.md`**.
- **Ads are Phase 4 (last)** — validate SEO/local/content first, then `/ads math`.
- Growth work runs as **one feature branch per phase off `develop`** (not one mega-branch).
