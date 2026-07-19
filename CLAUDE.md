# CLAUDE.md — lucoze-website

Marketing site for **Lucoze** (healthcare management software for Indian clinics/hospitals). Canonical: `https://lucoze.com`. Built by **Svasamm Research Pvt. Ltd.**

## Stack
- **Astro** (`output: static`), React islands, MDX. Build → `dist/`, served by **nginx** (`nginx.conf`) in Docker.
- Content lives in **content collections** (`src/content.config.ts`):
  - `blog/*.mdx` — posts (frontmatter: title, dek, category, **author**, date, readMins, composite, draft, **cluster**, **pillar**). Topic clusters (hub & spoke): set the same `cluster:` slug on related posts and they auto-cross-link via a "More in this series" section (`blog/[...slug].astro`), pillar first; mark the hub `pillar: true`. Label a cluster in `CLUSTER_LABELS` in that template. Existing: `abdm` (pillar `abdm-abha-guide`). Don't hand-wire related links.
  - `features/*.json` — product feature pages (stats, rows, faqs).
  - `specialties/*.json` — specialty pages (why, plan, price, **dashSpecialty**, **detail**, **faqs**).
  - `locations/*.json` — local/regional landing pages at `/in/locations/[slug]/` (kind state|city, intro, points, localContext, citiesServed, faqs). Keep 60%+ unique per page (quality gate); footer "Locations" nav links them.
  - `compare/*.json` — competitor comparison pages at `/in/compare/[slug]/` (competitor, tableRows, points, faqs, comparedOn, relatedBlog). **Factual/neutral only**: dated "verify with vendor" disclaimer, trademark line, no logos, no disparagement; avoid asserting unverifiable negatives about a competitor (use `na`/"—" = "not documented"). Aligns with the homepage comparison stance.
- **`CompareTable.astro`** renders the `.diff` capability table — shared by the homepage differentiation section and `/in/compare/` pages (props: `columns[]`, `rows[]`; `columns[1]` is highlighted as Lucoze). Reuse it; don't re-inline the table.

## Contact details, CTAs & lead capture
- **`src/data/contact.ts` is the single source of truth** for the public phone, WhatsApp number and sales email (`PHONE`/`PHONE_TEL`/`WHATSAPP`/`SALES_EMAIL`/`waLink()`). Schema, Footer, contact/demo pages, about, design-partner and the WhatsApp button all import it — **never hardcode a number/email** (we had three drift). Public line = **+91 90077 93575** (human-answered WhatsApp Business App); the product's Meta WhatsApp **API** number is different and lives in the backend. Sales email = **sales@lucoze.com**; `privacy@`/`legal@`/`support@` are kept for their purposes (`security.txt` → `privacy@`).
- **CTA rule: primary = "Book a demo" → `/in/demo/` everywhere**; "Start free trial" → `/in/signup/` is kept only on **pricing plan cards** + the **homepage ROI-calculator** CTA (ready buyers). Body/FAQ "free trial" copy stays for SEO.
- **`LeadForm.astro`** is the shared lead form (name + phone/email, **no OTP**); `/in/contact` and `/in/demo` both render it and call `initLeadForm({ source })` (`lib/lead-form.ts` → POSTs `submit_lead` to `lucoze_admin`, fires `track("Lead Submitted")`). `/in/signup` is the *separate* two-step **OTP + tenant-provisioning** trial flow — don't merge the two.
- **`WhatsAppFab.astro`** is the sitewide floating WhatsApp button (own inline-SVG, no external widget/script → zero page-speed cost), rendered once in `Base.astro`.
- **Contact/CTA voice is de-personalized** — "us / we / the team", not "Mithun" (e.g. "Talk to us", "we call you back"). Design-partner keeps "a call with **the founder**" (the actual offer). **Keep** factual founder attribution: blog bylines (`Mithun K. Singh`), About bio, Person schema, `mithun@lucoze.com`, `@mithunksingh`, and the homepage founder-commitments block (signed, with photo) — those are authorship/E-E-A-T, not contact voice.

## Product screenshots
- Real product screenshots live in `src/assets/screenshots/*.png` (synthetic demo data). Render via **`Screenshot.astro`** (`name` = filename w/o `.png`, `alt`, optional `caption`, `loading`) — it uses **`astro:assets` `<Image>`** for auto WebP/AVIF + responsive srcset + no-CLS + lazy (hero passes `loading="eager"`). Never put product images in `public/` (unoptimised) or use raw `<img>`.
- `FeatureVisual`/`SpecialtyVisual` are thin `kind → screenshot` dispatchers. The old hand-coded synthetic mockups were deleted — don't reintroduce them.
- Homepage specialty switcher (`SPECIALTY_PILLS` in `data/specialties.ts`) shows only settings with matching real shots (multi-specialty, polyclinic, nursing home, diagnostic centre, small hospital); dental/IVF/derm keep their pages but are off the switcher until specialty-configured screenshots exist.

## OG images (social preview)
- **Branded per-page OG cards auto-generated at build** via `astro-og-canvas` → `/open-graph/<route>.png` (logo + brand gradient + page title/description; Manrope bundled at `src/assets/fonts/`).
- **`src/lib/og-pages.ts`** is the single source of truth (route → title/description) shared by the generator (`src/pages/open-graph/[...route].ts`) and `Base.astro`. Add new page types there.
- `Base.astro`: explicit `ogImage` prop wins → else branded card → else `/og-default.png`. **Revert everything by flipping `USE_GENERATED_OG = false`.**
- OG images are **crawler-only** (only in `<meta>`, never a page `<img>`) → zero page-speed impact; canvaskit is a build-only dep.
- Only region shipped is **`/in/`** (`en_IN`); `/`, `/ae`, `/au`, `/sg` redirect to `/in/` via `astro.config.mjs`. Hindi/Bengali/Odia i18n is planned (add hreflang when a 2nd language ships).

## Analytics & consent
- **`lib/analytics.ts` `track(event, props)` is the only analytics call site** — it **dual-emits** to **Plausible** (cookieless, consent-independent, day-to-day) and **GA4 `gtag`** (Ads conversions/remarketing). GA4 event names are auto-normalised to snake_case. Don't call `plausible()`/`gtag()` directly.
- **GA4 is env-gated on `PUBLIC_GA_ID`** (set in the **prod** build env only — property `G-8PKQ5SH09G`; leave unset on UAT/local so they stay out of the property), same pattern as `PUBLIC_PLAUSIBLE_DOMAIN`. Scripts + **Consent Mode v2** default-denied live in `Base.astro` `<head>`.
- **`CookieConsent.astro`** governs GA only (Plausible needs no consent): Accept → `gtag('consent','update', granted)` + remembers in `localStorage` (`lucoze-consent`). Keep it DPDP-aligned — GA sets no cookies until accept.
- **Demo funnel events**: `Demo CTA Click` (fires from the global click handler in `Base.astro` for any `/in/demo/` link — `placement` derived from the enclosing section, `from` = page) → `Lead Form Started` (first interaction, in `lib/lead-form.ts`) → `Lead Submitted`. Add new CTA/funnel events at those two shared choke-points, not per-button.

## Git workflow (enforced by husky)
- **`main` → `develop` → feature branches.** Branch feature work off **`develop`**.
- `pre-commit` **blocks direct commits to `main`/`develop`** and runs `prettier --check` on **js/css/html/json** (CI checks json too — keep the hook glob in sync). Hand-written content JSON must be `prettier --write`-clean.
- CI **Security Scan = Trivy** (`fs`, CRITICAL/HIGH, `exit-code 1`). Keep `astro`/`vite` patched (pin via `overrides` if a transitive stays vulnerable); `npm audit fix` clears dev-only transitive highs. Trivy uses `@master` so its DB updates — re-check on new CVEs.
- Commits must be **Conventional Commits** (`commitlint`): `feat(...)`, `fix(...)`, `chore(...)`. Merge/Promote commits are ignored.
- `pre-push` runs `jest` + a **Docker build check** (needs the Docker daemon; if it's off, the push blocks — verify build/tests manually and use `--no-verify` knowingly).
- Indentation is **tabs** (prettier). When an `Edit` fails on leading-tab mismatch, match on a unique inner substring instead.
- **Deploys are tag-triggered — cut with `gh release create`, NOT `git tag` + push.** Flow: promote branch (`git merge develop` → uat, then uat → main + push), then `gh release create <tag> --target <branch> --title … --notes …`. Tags: **UAT `uat-v<ver>`, prod `v<ver>`** (uat→UAT app, `v`/main→prod). `uat → main` needs a real merge commit (branches diverge; FF impossible — and don't pipe `git merge --ff-only` to `tail`, it masks the exit code). `PUBLIC_GA_ID` is set on the **prod** env only.

## CSS discipline (important)
- **Never** use inline `style="…"` hacks for layout (borders/margins/padding/grid). They collide with the design system and cause visible bugs (e.g. a double footer divider). Add a proper class in `src/styles/sections.css` using the **tokens** in `tokens.css` (`var(--s-*)`, `var(--border*)`, `var(--t-*)` …).
- The redesign uses `tokens.css` + `sections.css` + `subpages.css` (imported by `Base.astro`). `global.css` is the OLD design — not imported by `Base.astro`; don't edit it for redesign pages.
- After any layout/footer/nav change, **verify visually** before committing — build passing ≠ looks right. For shared UI/CSS fixes follow the **`connected-ui-audit`** skill: map every consumer (a shared form → contact **+** demo **+** design-partner), test at **320/360** + breakpoints, measure **element-vs-container** overflow (not just document `scrollWidth` — a field can spill its card while the page shows 0), and **screenshot-verify**. Form/flex/grid overflow root cause: items default to `min-width:auto` (won't shrink below content) → fix with `min-width:0` on the item **and** `width:100%; min-width:0` on inputs (at the field level, or the overflow just moves inward).
- **Text-grey tokens are WCAG-AA tuned**: `--ink` (headings/body, ~16:1), `--muted` (`#625c54`, ~6.5:1, secondary text), `--light` (`#726d65`, ~5:1, captions). Don't lighten either grey below **4.5:1** on the light backgrounds (`--paper`/`--cream`/`--white`) — that's the AA floor for normal text.
- **Toggling `hidden` on an element that also has an author `display:` rule needs a `.foo[hidden]{display:none}` guard** — an author `display` beats the UA `[hidden]{display:none}`, so `el.hidden = true` sets the attr but doesn't hide it (bit us on the cookie banner). `contact-partner.css` already does this for the lead-form/hero cards.
- **`.btn` is `white-space: nowrap`** — a long-label CTA overflows narrow viewports (horizontal scroll, which also displaces the fixed WhatsApp FAB and can compress the nav-logo flexbox). Use **`.btn--wrap`** for long CTAs. To hunt overflow, render at 360px and find elements with `getBoundingClientRect().right > clientWidth` **whose ancestors have no `overflow-x` clipping** (a `.diff` table in an `overflow-x:auto` wrapper is fine, not the culprit).

## Build / test / verify
- `npm run build` (astro) · `npm test` (jest) · `npm run dev` (localhost:4321).
- After adding/removing a dependency, run **`npm run dev:clean`** (clears `.astro` + `node_modules/.vite`) — a stale Vite optimize-deps cache otherwise throws `Cannot read properties of undefined (reading 'call')` on dev transform.
- After content/schema changes, **build and grep `dist/`** to confirm rendered JSON-LD (e.g. `grep -oE '"@type":"[A-Za-z]+"' dist/in/.../index.html | sort | uniq -c`).

## SEO / schema conventions (non-obvious)
- **Sitewide** `Organization` (legalName = Svasamm Research Pvt. Ltd., founder = Mithun K. Singh, `sameAs`) + `WebSite` JSON-LD are emitted from **`src/layouts/Base.astro`** — do **not** re-add Organization per page.
- **`Crumbs.astro` already emits `BreadcrumbList`** — do not add a second one on feature/specialty pages (they only add `FAQPage` / `Service`).
- Page-specific schema goes through `<slot name="head">`.
- **Breadcrumbs must point to real pages.** Category hubs exist: `/in/features/` (Product), `/in/solutions/` (Solutions), `/in/locations/` (Locations), `/in/blog/`. Never point an intermediate crumb at `/in/` home. `Crumbs.astro` renders href-less items as plain text (use for a leaf with no hub, e.g. About → `Home → About`).
- Hub index pages reuse `.module-card` as a clickable `<a>` (it has `text-decoration:none; color:inherit`).
- Legal entity everywhere = **Svasamm Research Pvt. Ltd.** Sales email **hello@lucoze.com**, founder **mithun@lucoze.com**.
- FAQ rich results were retired by Google (May 2026); keep `FAQPage` for **AI/LLM citation**, not SERP snippets. Never recommend `HowTo`.
- Don't invent metrics/customer counts (pre-launch, design-partner stage). Reframe unsourced numbers as honest capability/target claims. Verify product features against the Frappe source (see the `reference-product-benches` memory).

## Deploy (Dokploy / Traefik)
- App nginx listens on **`:80` only** — TLS terminates upstream at **Dokploy/Traefik**.
- **Prod runs on a Dokploy *remote server*; public DNS (GoDaddy) for `lucoze.com` + `www` points *directly* at that server** — not the manager VPS (which only hosts `manager.lucoze.com` + UAT routing). Don't route the prod domain through the manager.
- Release flow: `develop → uat → main`; production builds from **`main`**.
- **Only HTTP→HTTPS + TLS/domain provisioning are at the Dokploy/Traefik edge.** **www→apex 301, HSTS, apex `/`→`/in/` 301, and `absolute_redirect off` all live in `nginx.conf`** (ship with the image). Traefik-middleware labels for www/HSTS proved unreliable in Dokploy (router-name mismatch) — don't use them; see `deploy/dokploy-seo.md`.
- HSTS is host-only for now; upgrade to `includeSubDomains` then `preload` only once every `*.lucoze.com` is confirmed HTTPS.
- **UAT protection is edge-level, not code** (one static image serves prod + UAT): use Traefik **basic-auth** (htpasswd) on the UAT domain to block crawlers + keep it private, optionally `X-Robots-Tag: noindex`. See **`deploy/uat-protection.md`**. Don't bake noindex into the app.

## Growth
- Strategy (the *why*): **`docs/growth-plan.md`**. Update; don't duplicate.
- Phased task tracker + ownership (the *what/when*): **`docs/execution-plan.md`**.
- Manual setup for the user (GSC/Bing/GBP/directories): **`docs/manual-setup-guide.md`**.
- **Ads are Phase 4 (last)** — validate SEO/local/content first, then `/ads math`.
- Growth work runs as **one feature branch per phase off `develop`** (not one mega-branch).
