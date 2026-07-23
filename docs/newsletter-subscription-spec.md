# Newsletter Subscription — Design Spec

**Status:** Approved design (2026-07-22). First brick of the marketing-automation workstream.
**Scope owner:** Mithun K. Singh · **Author:** design session

## 1. Goal
Let visitors subscribe to the Lucoze blog newsletter from lucoze.com, and start collecting
confirmed email subscribers in a self-hosted engine at **marketing.lucoze.com**. This is the
capture-and-store brick. Auto-sending a newsletter when a post publishes is the **next** brick
(sketched in §9, not built here).

## 2. Decisions locked in this session
- **Engine:** self-host **Listmonk** (open-source, SES-native). We do not build the mail engine.
- **Submit path:** **inline AJAX** (option A) — the form POSTs cross-origin to Listmonk's public
  API; the user stays on the page and sees an inline "check your inbox" state.
- **Sending backend:** **Amazon SES** — already configured and out of the sandbox (it powers the
  book-a-demo / lead email flow today). Domain is already verified with DKIM/SPF. Reuse it.
- **Placements:** one reusable `SubscribeForm` component in three spots — sitewide footer,
  end of each blog post, blog-index header. (No dedicated `/subscribe` page for the MVP.)
- **Double opt-in:** ON (Listmonk sends a confirmation email; only confirmed emails count).

## 3. Architecture
```
lucoze.com (static Astro, nginx)          marketing.lucoze.com (Docker / Dokploy)
┌───────────────────────────┐             ┌───────────────────────────────────┐
│ SubscribeForm.astro        │  fetch()    │ Listmonk  ── Postgres              │
│  · Footer.astro (sitewide) │ ─POST────▶  │  · list: "Lucoze Blog" (opt-in)    │
│  · blog/[...slug] (post end)│  (CORS)     │  · confirm + welcome templates     │
│  · blog/index (header band) │             │  · unsubscribe + bounce handling   │
│  lib/subscribe.ts           │ ◀─JSON──    │  · admin UI (subscribers, campaigns)│
└───────────────────────────┘             └──────────────────┬────────────────┘
                                                              │ SMTP
                                                              ▼ Amazon SES (existing)
```
Listmonk is the entire engine (lists, double opt-in, unsubscribe, bounce/complaint handling,
analytics, campaigns). Our net-new code is one Astro component + a small submit helper + config.

## 4. Component A — marketing.lucoze.com (Listmonk)
New minimal repo **`lucoze-marketing`** holding deploy config only (no bespoke app code):
- `docker-compose.yml`: `listmonk/listmonk` + `postgres` (named volume). Listmonk listens `:9000`
  internally; TLS terminates at Dokploy/Traefik for `marketing.lucoze.com` (same edge pattern as
  lucoze.com/admin — app container is HTTP-only behind Traefik).
- `config.toml` (Listmonk): admin creds (secret), Postgres DSN, `app.root_url =
  https://marketing.lucoze.com`, SMTP block pointed at the **SES SMTP endpoint** with SES SMTP
  credentials and a verified sender (**`news@lucoze.com`**, under the already-verified lucoze.com
  domain identity). Reply-to a monitored inbox.
- One-time Listmonk setup (via admin UI / import): create list **"Lucoze Blog"** (public,
  double opt-in); brand the **confirmation**, **welcome**, and **unsubscribe** templates + the
  public pages with Lucoze colours/logo/copy; note the list UUID for the form.
- **CORS:** allow `https://lucoze.com` (and uat host) as an origin for the public subscription
  API — set at Listmonk config or the Traefik edge. Scope to only the public subscribe endpoint.

## 5. Component B — lucoze-website (SubscribeForm)
- `src/components/SubscribeForm.astro` — email input + submit button, Lucoze styling
  (`sections.css`/`subpages.css` tokens, no inline-style hacks), a `variant` prop
  (`footer | inline | band`) for the three placement contexts. Accessible: `<label>`, `type=email`,
  `required`, `aria-live` status region, keyboard + 320/360 + desktop clean.
- `src/lib/subscribe.ts` — `subscribe(email)`: `fetch` POST to Listmonk public subscription API on
  marketing.lucoze.com with the list UUID; handles success / already-subscribed / error; fires
  `track("Newsletter Subscribed", { placement })` via the existing `lib/analytics.ts` (dual Plausible
  + GA). No new analytics call sites — reuse `track`.
- States: idle → submitting → "Check your inbox to confirm" (success) / inline error. Never blocks
  the page; disables the button while in-flight.
- **Spam guard:** a hidden honeypot field + basic client rate-limit; Listmonk double opt-in is the
  real guard (unconfirmed = never emailed, never counted).
- **Placements:**
  - `Footer.astro` (sitewide, `variant=footer`) — compact single-line field.
  - `blog/[...slug].astro` (`variant=inline`) — an "Get posts like this in your inbox" block after
    the article, above/merged with the existing "Found this useful?" CTA (avoid two stacked CTAs —
    fold subscribe into that section).
  - `blog/index.astro` (`variant=band`) — a subscribe band in the index header.
- **CSP:** add `https://marketing.lucoze.com` to `connect-src` in `nginx.conf` (currently blocks it).
- **DPDP/consent:** microcopy under the field ("We'll email you new posts. Unsubscribe anytime.")
  + link to `/in/privacy/`. Double opt-in is the consent record.

## 6. Data flow
1. Visitor submits email → `subscribe.ts` POSTs to Listmonk (status: unconfirmed).
2. Listmonk sends a branded **confirmation** email via SES.
3. Visitor clicks confirm → Listmonk marks **confirmed**, shows branded welcome page, optional
   welcome email.
4. Only confirmed subscribers are in the sendable list. Unsubscribe + bounce/complaint handled by
   Listmonk automatically (protects SES reputation).

## 7. Deliverability (mostly DONE — reuse existing SES)
- Domain verified + DKIM/SPF set + out of sandbox already (demo flow). **To confirm:** SES **SMTP
  credentials** available for Listmonk (create a dedicated SMTP cred if needed), and a **DMARC**
  record exists for lucoze.com (add `p=none` reporting if not). Sender `news@lucoze.com` isolates
  newsletter reputation from transactional mail.
- Unsubscribe + List-Unsubscribe header: Listmonk provides; keep enabled.

## 8. Security / privacy
- Listmonk admin behind strong creds + Traefik; only the **public subscribe** endpoint is
  CORS-exposed to lucoze.com. Postgres not publicly exposed.
- No PII stored on lucoze.com (static); email lives only in Listmonk/Postgres on marketing.lucoze.com.
- Honeypot + double opt-in prevent list poisoning / signup abuse.

## 9. Out of scope — next brick (send-on-publish), sketched only
When the weekly drip cron rebuilds+deploys and a new post goes live, a step creates + sends a
Listmonk **campaign** (title/excerpt/link) to the "Lucoze Blog" list via the Listmonk API. Hooks
into the existing `build-publish.yml` deploy job. Designed separately once capture is live.

## 10. Testing
- e2e (Playwright, added to the existing smoke suite): `SubscribeForm` renders + submits (Listmonk
  call mocked/stubbed) at all three placements, at 360 + desktop, no overflow; success + error
  states render.
- CSP infra check: `connect-src` allows marketing.lucoze.com.
- Manual once SES live: real double-opt-in round trip (submit → confirm email → confirmed).

## 11. Owner tasks (gate go-live; site + Listmonk build can proceed in parallel)
- Point `marketing.lucoze.com` DNS at the Dokploy server; create the Dokploy app + Postgres.
- Provide/confirm SES **SMTP credentials** for Listmonk and the `news@lucoze.com` sender.
- Confirm/add **DMARC** DNS record.

## 12. Success criteria
Subscribe form live in all three placements on lucoze.com; a real email submitted on the site
arrives as a **confirmed** subscriber in Listmonk after double opt-in; unsubscribe works; e2e +
CSP checks green; zero new analytics call sites (reuses `track`).
