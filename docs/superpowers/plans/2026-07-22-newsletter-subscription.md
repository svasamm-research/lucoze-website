# Newsletter Subscription Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors subscribe to the Lucoze blog newsletter from lucoze.com, storing confirmed (double-opt-in) subscribers in self-hosted Listmonk on marketing.lucoze.com, sending via existing Amazon SES.

**Architecture:** Two independent parts. **Part A** stands up Listmonk (Docker + Postgres) on marketing.lucoze.com behind Dokploy/Traefik, sending through the already-configured SES. **Part B** adds one reusable `SubscribeForm` Astro component to lucoze.com (footer, blog-post-end, blog-index header) that POSTs email via inline AJAX to Listmonk's public JSON API. Parts A and B can be built in parallel; Part B is fully testable against a mock without Part A live.

**Tech Stack:** Listmonk (Go binary, official Docker image) + Postgres; Amazon SES (SMTP); Astro (static) + TypeScript; Jest (unit) + Playwright (e2e); nginx (CSP); Dokploy/Traefik (edge TLS + deploy webhook).

**Design spec:** `docs/newsletter-subscription-spec.md` (read it first).

## Global Constraints

- **Submit path = inline AJAX** → `POST {PUBLIC_MARKETING_URL}/api/public/subscription` with JSON `{ email, list_uuids: [PUBLIC_NEWSLETTER_LIST_UUID] }`. User stays on the page.
- **Double opt-in ON** — Listmonk sends the confirmation email; only confirmed emails count.
- **Reuse existing SES** — domain verified, DKIM/SPF set, out of sandbox (powers the demo/lead mail). Listmonk uses SES **SMTP**. Sender `news@lucoze.com`.
- **`PUBLIC_*` are BUILD ARGS wired in THREE places** — consumer → `ARG`/`ENV` in `Dockerfile` → `urls` step + `build-args` in `.github/workflows/build-publish.yml` (empty for UAT, set for prod). Miss any and the feature silently no-ops in prod.
- **Analytics:** only `lib/analytics.ts` `track(event, props)` — no direct `plausible()`/`gtag()`. New event: `Newsletter Subscribed` with `{ placement }`.
- **CSS:** tokens in `sections.css`/`subpages.css`; never inline-style layout. `.btn` is `white-space:nowrap` — use `.btn--wrap` for long labels.
- **Branching:** feature branch off `develop` (already on `feat/newsletter-subscription`). Conventional Commits. `pre-commit` runs prettier on js/css/html/json; `pre-push` runs jest + Playwright e2e + Docker build + nginx check.
- **marketing.lucoze.com app container is HTTP-only** behind Traefik (same edge pattern as lucoze.com); TLS + domain at the Dokploy edge.
- **Verify Listmonk public API shape** is `POST /api/public/subscription` (JSON, Listmonk ≥ v2.5) before wiring — pin the Listmonk image to a known version.

---

# PART A — Listmonk engine (new `lucoze-marketing` repo)

> These tasks stand up the mail engine. Several steps are ops actions (DNS, Dokploy, SES creds) an agent cannot fully automate — they are marked **[OWNER]**. Do Part A steps in order; each ends with a concrete verification.

### Task A1: Scaffold `lucoze-marketing` repo with Listmonk + Postgres (local up)

**Files:**
- Create: `lucoze-marketing/docker-compose.yml`
- Create: `lucoze-marketing/config.toml`
- Create: `lucoze-marketing/.gitignore`
- Create: `lucoze-marketing/README.md`

- [ ] **Step 1: Create the repo dir and git init**

```bash
mkdir -p ~/Projects/web-dev/lucoze-marketing && cd ~/Projects/web-dev/lucoze-marketing
git init && printf "config.toml\n.env\n*.log\n" > .gitignore
```
(Real `config.toml` holds secrets → gitignored. Commit `config.toml.example` instead — see Step 3.)

- [ ] **Step 2: Write `docker-compose.yml`** (pin Listmonk version)

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: listmonk
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: listmonk
    volumes:
      - listmonk-db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U listmonk"]
      interval: 10s
      timeout: 5s
      retries: 6

  app:
    image: listmonk/listmonk:v4.1.0
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "9000:9000" # Traefik/Dokploy terminates TLS and proxies to this
    volumes:
      - ./config.toml:/listmonk/config.toml
    command: [sh, -c, "./listmonk --install --idempotent --yes && ./listmonk --upgrade --yes && ./listmonk"]

volumes:
  listmonk-db:
```

- [ ] **Step 3: Write `config.toml.example`** (commit this; real `config.toml` is gitignored)

```toml
[app]
address = "0.0.0.0:9000"
admin_username = "admin"
admin_password = "CHANGE_ME_STRONG"

[db]
host = "db"
port = 5432
user = "listmonk"
password = "CHANGE_ME_DB"
database = "listmonk"
ssl_mode = "disable"
max_open = 25
max_idle = 25
```
Copy to `config.toml`, fill real secrets, keep out of git.

- [ ] **Step 4: Bring it up locally and verify the admin loads**

```bash
cp config.toml.example config.toml   # edit secrets
POSTGRES_PASSWORD=$(grep -A5 '\[db\]' config.toml | grep password | cut -d'"' -f2) docker compose up -d
sleep 20 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/
```
Expected: `200` (Listmonk admin login page). If not, `docker compose logs app`.

- [ ] **Step 5: README + commit**

Write `README.md` (what this is, how to run, that `config.toml` is secret). Then:
```bash
git add docker-compose.yml config.toml.example .gitignore README.md
git commit -m "feat: listmonk + postgres compose for marketing.lucoze.com"
```

### Task A2: Point Listmonk at SES SMTP and verify a real send

**Files:**
- Modify: `lucoze-marketing/config.toml` (SMTP block; and `config.toml.example` with placeholders)

**[OWNER] prerequisites:** an SES **SMTP credential** (username/password — create in AWS SES console → SMTP settings if none exists) and confirm `news@lucoze.com` is sendable under the verified `lucoze.com` domain identity.

- [ ] **Step 1: Add the SMTP block to `config.toml`** (and a redacted copy in the example)

```toml
[smtp.ses]
enabled = true
host = "email-smtp.ap-south-1.amazonaws.com"   # match your SES region
port = 587
auth_protocol = "login"
username = "SES_SMTP_USERNAME"
password = "SES_SMTP_PASSWORD"
tls_type = "STARTTLS"
tls_skip_verify = false
max_conns = 10
```
Set the default from-address in Listmonk settings later (Task A3): `Lucoze <news@lucoze.com>`.

- [ ] **Step 2: Restart and send a test email from the Listmonk admin**

```bash
docker compose restart app
```
In the admin UI (`http://localhost:9000` → Settings → SMTP → "Send test") send to your own inbox.
Expected: email arrives from `news@lucoze.com`; no SMTP error in `docker compose logs app`.

- [ ] **Step 3: Commit the example (never the real config)**

```bash
git add config.toml.example
git commit -m "feat: SES SMTP config for listmonk (example)"
```

### Task A3: Create the "Lucoze Blog" list + brand the double-opt-in templates

**No repo files** — this is Listmonk admin configuration (persisted in Postgres). Record outputs.

- [ ] **Step 1: Create the list**

Admin → Lists → New: name `Lucoze Blog`, type **Public**, opt-in **Double**. Save.
**Record the list UUID** (Lists table → the list's UUID) — Part B needs it as `PUBLIC_NEWSLETTER_LIST_UUID`.

- [ ] **Step 2: Set the default sender + root URL**

Settings → General: `app.root_url = https://marketing.lucoze.com`; default from-email `Lucoze <news@lucoze.com>`.

- [ ] **Step 3: Brand the opt-in + welcome + unsubscribe templates and public pages**

Campaigns → Templates (and Settings → Appearance / public page templates): apply Lucoze colours (warm orange `--primary`), logo, and copy to the **confirmation**, **welcome**, and **unsubscribe** emails + the public confirm/unsubscribe pages. Keep the List-Unsubscribe header on.

- [ ] **Step 4: Verify a local double-opt-in round trip**

Use the public form (`http://localhost:9000/subscription/form`) or `curl` the JSON API:
```bash
curl -s -X POST http://localhost:9000/api/public/subscription \
  -H "Content-Type: application/json" \
  -d '{"email":"you+test@yourdomain.com","list_uuids":["<LIST_UUID>"]}'
```
Expected: JSON success; a **confirmation** email arrives; clicking confirm marks the subscriber **confirmed** in the admin.

### Task A4: Deploy to marketing.lucoze.com + enable CORS for lucoze.com

**Files:**
- Create: `lucoze-marketing/deploy/dokploy-notes.md` (document the edge config)

**[OWNER] prerequisites:** `marketing.lucoze.com` DNS → Dokploy server; a Dokploy Compose app pointing at this repo.

- [ ] **Step 1: Create the Dokploy app + domain**

In Dokploy: new Compose service from `lucoze-marketing`; set env `POSTGRES_PASSWORD`; attach domain `marketing.lucoze.com` (Traefik issues LE cert, proxies to app `:9000`). Deploy.

- [ ] **Step 2: Verify prod admin + public API over HTTPS**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://marketing.lucoze.com/
```
Expected: `200`.

- [ ] **Step 3: Enable CORS for the public subscribe endpoint**

Listmonk doesn't emit CORS headers itself → add them at the **Traefik edge** for `marketing.lucoze.com` (Dokploy middleware): allow-origin `https://lucoze.com` (+ the uat host if used), methods `POST, OPTIONS`, headers `Content-Type`, on path `/api/public/subscription`. Document exact middleware in `deploy/dokploy-notes.md`.

- [ ] **Step 4: Verify CORS preflight from the browser origin**

```bash
curl -s -i -X OPTIONS https://marketing.lucoze.com/api/public/subscription \
  -H "Origin: https://lucoze.com" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin"
```
Expected: `access-control-allow-origin: https://lucoze.com`.

- [ ] **Step 5: Commit deploy notes**

```bash
cd ~/Projects/web-dev/lucoze-marketing
git add deploy/dokploy-notes.md && git commit -m "docs: dokploy + CORS deploy notes"
```

---

# PART B — SubscribeForm on lucoze.com (`lucoze-website` repo)

> All Part B work is on branch `feat/newsletter-subscription`. Fully testable against a mocked Listmonk; does not need Part A live.

### Task B1: `subscribe()` helper + unit tests

**Files:**
- Create: `src/lib/subscribe.ts`
- Test: `tests/subscribe.test.js`

**Interfaces:**
- Produces: `subscribe(email: string, placement: string): Promise<{ ok: boolean; reason?: "invalid" | "network" | "bot"; }>` — POSTs JSON to Listmonk; fires `track("Newsletter Subscribed", { placement })` on success; returns `{ok:false, reason:"bot"}` if the honeypot is set (caller passes it), `"invalid"` for a bad email, `"network"` on fetch failure.

- [ ] **Step 1: Write the failing unit test**

```javascript
// tests/subscribe.test.js
import { jest } from "@jest/globals";

const track = jest.fn();
jest.unstable_mockModule("../src/lib/analytics.ts", () => ({ track }));
const { subscribe, isValidEmail } = await import("../src/lib/subscribe.ts");

beforeEach(() => {
	track.mockClear();
	globalThis.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
	// build-time envs the module reads:
	import.meta.env = { PUBLIC_MARKETING_URL: "https://marketing.lucoze.com", PUBLIC_NEWSLETTER_LIST_UUID: "uuid-1" };
});

test("rejects an invalid email without calling fetch", async () => {
	const r = await subscribe("nope", "footer");
	expect(r).toEqual({ ok: false, reason: "invalid" });
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("POSTs JSON to the Listmonk public API and tracks on success", async () => {
	const r = await subscribe("a@b.com", "footer");
	expect(r.ok).toBe(true);
	const [url, opts] = globalThis.fetch.mock.calls[0];
	expect(url).toBe("https://marketing.lucoze.com/api/public/subscription");
	expect(JSON.parse(opts.body)).toEqual({ email: "a@b.com", list_uuids: ["uuid-1"] });
	expect(track).toHaveBeenCalledWith("Newsletter Subscribed", { placement: "footer" });
});

test("returns network reason when fetch rejects", async () => {
	globalThis.fetch = jest.fn(() => Promise.reject(new Error("down")));
	const r = await subscribe("a@b.com", "footer");
	expect(r).toEqual({ ok: false, reason: "network" });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx jest tests/subscribe.test.js`
Expected: FAIL (`subscribe` not found).

- [ ] **Step 3: Implement `src/lib/subscribe.ts`**

```typescript
import { track } from "./analytics";

export const isValidEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

type Result = { ok: boolean; reason?: "invalid" | "network" | "bot" };

/** POST an email to Listmonk's public subscription API (double opt-in). */
export async function subscribe(email: string, placement: string, honeypot = ""): Promise<Result> {
	if (honeypot) return { ok: false, reason: "bot" }; // silently drop bots
	const clean = email.trim();
	if (!isValidEmail(clean)) return { ok: false, reason: "invalid" };
	const base = import.meta.env.PUBLIC_MARKETING_URL;
	const list = import.meta.env.PUBLIC_NEWSLETTER_LIST_UUID;
	if (!base || !list) return { ok: false, reason: "network" }; // not configured
	try {
		const res = await fetch(`${base}/api/public/subscription`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: clean, list_uuids: [list] }),
		});
		if (!res.ok) return { ok: false, reason: "network" };
		track("Newsletter Subscribed", { placement });
		return { ok: true };
	} catch {
		return { ok: false, reason: "network" };
	}
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npx jest tests/subscribe.test.js`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/subscribe.ts tests/subscribe.test.js
git commit -m "feat(newsletter): subscribe() helper posting to Listmonk public API"
```

### Task B2: `SubscribeForm.astro` component (3 variants, gated on config)

**Files:**
- Create: `src/components/SubscribeForm.astro`
- Modify: `src/styles/subpages.css` (append `.subscribe*` styles)

**Interfaces:**
- Consumes: `subscribe()` from Task B1.
- Produces: `<SubscribeForm variant="footer" | "inline" | "band" placement="..." />`. Renders **nothing** when `import.meta.env.PUBLIC_MARKETING_URL` is unset (UAT/no-engine → silent no-op, same gating pattern as GA).

- [ ] **Step 1: Write the component**

```astro
---
// Newsletter subscribe form. One component, three placement variants. Submits
// via lib/subscribe.ts (inline AJAX → Listmonk). Renders nothing if the
// marketing engine URL isn't wired (UAT), like the GA gating pattern.
interface Props { variant?: "footer" | "inline" | "band"; placement: string; }
const { variant = "footer", placement } = Astro.props;
const enabled = !!import.meta.env.PUBLIC_MARKETING_URL;
---
{
	enabled && (
		<form class:list={["subscribe", `subscribe--${variant}`]} data-subscribe data-placement={placement}>
			<div class="subscribe__row">
				<label class="sr-only" for={`sub-${placement}`}>Email address</label>
				<input id={`sub-${placement}`} name="email" type="email" required autocomplete="email"
					placeholder="you@clinic.com" class="subscribe__input" />
				{/* honeypot: hidden from humans, bots fill it */}
				<input type="text" name="company" tabindex="-1" autocomplete="off" class="subscribe__hp" aria-hidden="true" />
				<button type="submit" class="btn btn--primary subscribe__btn">Subscribe</button>
			</div>
			<p class="subscribe__note" aria-live="polite">
				New posts in your inbox. Unsubscribe anytime. <a href="/in/privacy/">Privacy</a>.
			</p>
		</form>
	)
}
<script>
	import { subscribe } from "../lib/subscribe";
	document.querySelectorAll<HTMLFormElement>("form[data-subscribe]").forEach((form) => {
		const note = form.querySelector<HTMLElement>(".subscribe__note");
		const btn = form.querySelector<HTMLButtonElement>(".subscribe__btn");
		const defaultNote = note?.innerHTML ?? "";
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const email = (form.elements.namedItem("email") as HTMLInputElement).value;
			const hp = (form.elements.namedItem("company") as HTMLInputElement).value;
			const placement = form.getAttribute("data-placement") || "unknown";
			if (btn) btn.disabled = true;
			const r = await subscribe(email, placement, hp);
			if (note) {
				if (r.ok) note.textContent = "Check your inbox to confirm your subscription.";
				else if (r.reason === "invalid") note.textContent = "Please enter a valid email address.";
				else if (r.reason === "bot") note.innerHTML = defaultNote; // silent
				else note.textContent = "Something went wrong — please try again.";
			}
			if (btn) btn.disabled = false;
			if (r.ok) form.reset();
		});
	});
</script>
```

- [ ] **Step 2: Append styles to `src/styles/subpages.css`**

```css
.subscribe__row { display: flex; gap: var(--s-2); flex-wrap: wrap; }
.subscribe__input { flex: 1; min-width: 0; width: 100%; padding: var(--s-3) var(--s-4);
	border: 1px solid var(--border); border-radius: var(--r-md); font: inherit; background: var(--white); }
.subscribe__btn { white-space: nowrap; }
.subscribe__hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.subscribe__note { font-size: 13px; color: var(--muted); margin-top: var(--s-2); }
.subscribe--band { max-width: 520px; }
.subscribe--footer .subscribe__input { min-width: 180px; }
@media (max-width: 480px) { .subscribe__btn { width: 100%; } }
```

- [ ] **Step 3: Build to verify it compiles**

Run: `npm run build`
Expected: build completes (component unused as yet renders nowhere — that's fine; wiring is B3).

- [ ] **Step 4: Commit**

```bash
git add src/components/SubscribeForm.astro src/styles/subpages.css
git commit -m "feat(newsletter): SubscribeForm component (footer/inline/band variants)"
```

### Task B3: Wire the three placements

**Files:**
- Modify: `src/components/redesign/Footer.astro` (sitewide — add `<SubscribeForm variant="footer" placement="footer" />`)
- Modify: `src/pages/in/blog/index.astro` (header band — `variant="band" placement="blog-index"`)
- Modify: `src/pages/in/blog/[...slug].astro` (fold into the "Found this useful?" section — `variant="inline" placement="blog-post"`)

- [ ] **Step 1: Add to the footer**

Import `SubscribeForm` in `Footer.astro` and place it in a sensible footer column with a small heading ("Follow the blog"). Match footer styling.

- [ ] **Step 2: Add the blog-index band**

In `blog/index.astro`, under the SubHero/header, add a `.subscribe--band` block with a one-line heading ("Get new posts in your inbox").

- [ ] **Step 3: Fold into the blog-post CTA**

In `blog/[...slug].astro`, inside the existing "Found this useful?" `.cta-final` section (lines ~180–199), add `<SubscribeForm variant="inline" placement="blog-post" />` beneath the copy — one CTA block, not two stacked. Import the component in the frontmatter.

- [ ] **Step 4: Build + eyeball**

Run: `npm run build && npm run preview` → open `/in/`, `/in/blog/`, a post. (Form renders only if `PUBLIC_MARKETING_URL` is set locally — export it for the check: `PUBLIC_MARKETING_URL=https://marketing.lucoze.com PUBLIC_NEWSLETTER_LIST_UUID=x npm run build`.)
Expected: form in all three spots; no 360px overflow.

- [ ] **Step 5: Commit**

```bash
git add src/components/redesign/Footer.astro src/pages/in/blog/index.astro "src/pages/in/blog/[...slug].astro"
git commit -m "feat(newsletter): place SubscribeForm in footer, blog index, blog post"
```

### Task B4: CSP — allow the Listmonk origin

**Files:**
- Modify: `nginx.conf` (the `content-security-policy` `connect-src`)

- [ ] **Step 1: Add `https://marketing.lucoze.com` to `connect-src`**

In `nginx.conf`, append `https://marketing.lucoze.com` to the `connect-src` directive of the CSP header (alongside the existing admin/analytics origins).

- [ ] **Step 2: Verify via the nginx infra check**

Run: `npm run build && sh scripts/check-nginx.sh` (needs Docker)
Expected: `nginx infra check passed`; CSP present.

- [ ] **Step 3: Commit**

```bash
git add nginx.conf
git commit -m "feat(newsletter): allow marketing.lucoze.com in CSP connect-src"
```

### Task B5: Wire `PUBLIC_MARKETING_URL` + `PUBLIC_NEWSLETTER_LIST_UUID` build args (3 places)

**Files:**
- Modify: `Dockerfile` (`ARG`/`ENV` for both vars)
- Modify: `.github/workflows/build-publish.yml` (`urls` step outputs + `build-args`)

- [ ] **Step 1: Add build args to `Dockerfile`**

Add `ARG PUBLIC_MARKETING_URL` + `ENV PUBLIC_MARKETING_URL=$PUBLIC_MARKETING_URL` and the same for `PUBLIC_NEWSLETTER_LIST_UUID`, next to the existing `PUBLIC_*` args.

- [ ] **Step 2: Add to the workflow's `urls` step + build-args**

In `build-publish.yml`, in the `Resolve environment URLs` step, output `marketing_url` and `newsletter_list_uuid`: **empty for UAT**, prod values for prod (`https://marketing.lucoze.com` + the list UUID from Task A3). Add both to the `build-args` block of the build-push step.

- [ ] **Step 3: Confirm the pattern matches existing PUBLIC_ vars**

Grep to ensure both new vars appear in all three places:
```bash
grep -c "PUBLIC_MARKETING_URL" Dockerfile .github/workflows/build-publish.yml src/lib/subscribe.ts
```
Expected: each file ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .github/workflows/build-publish.yml
git commit -m "feat(newsletter): wire PUBLIC_MARKETING_URL + list UUID build args"
```

### Task B6: e2e smoke — form renders + submits (mocked) at 360 + desktop

**Files:**
- Modify: `tests/e2e/smoke.spec.ts` (add one test)

- [ ] **Step 1: Add the e2e test** (build the test site with the envs set so the form renders)

```typescript
test("newsletter: subscribe form renders and submits (mocked)", async ({ page }) => {
	// Stub the Listmonk call so no real network/opt-in happens.
	await page.route("**/api/public/subscription", (route) =>
		route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
	);
	await page.goto("/in/blog/");
	const form = page.locator("form[data-subscribe]").first();
	await expect(form).toBeVisible();
	await form.locator('input[type="email"]').fill("reader@clinic.com");
	await form.locator("button[type=submit]").click();
	await expect(form.locator(".subscribe__note")).toContainText("Check your inbox");

	// invalid email path
	await page.setViewportSize({ width: 360, height: 800 });
	await page.reload();
	const f2 = page.locator("form[data-subscribe]").first();
	await f2.locator('input[type="email"]').fill("nope");
	await f2.locator("button[type=submit]").click({ force: true });
	// native validity blocks submit OR our handler reports invalid — assert no crash + no overflow
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Set envs so the form renders in the Playwright build**

`playwright.config.ts` `webServer.command` is `npm run build && npm run preview`. Prefix the build with the envs (edit the command to `PUBLIC_MARKETING_URL=https://marketing.lucoze.com PUBLIC_NEWSLETTER_LIST_UUID=test-uuid npm run build && npm run preview`), or export them in CI. Document in the test comment.

- [ ] **Step 3: Run e2e, verify pass** (kill any stale :4321 server first)

```bash
lsof -tiTCP:4321 -sTCP:LISTEN | xargs -r kill; npx playwright test -g "newsletter"
```
Expected: 1 passed.

- [ ] **Step 4: Full gate + commit**

```bash
npx jest && npx playwright test
git add tests/e2e/smoke.spec.ts playwright.config.ts
git commit -m "test(newsletter): e2e subscribe form renders + submits (mocked)"
```

### Task B7: CLAUDE.md + ship to UAT → prod

- [ ] **Step 1: Document in CLAUDE.md**

Add a short line to the blog/contact section: newsletter capture = `SubscribeForm.astro` → `lib/subscribe.ts` → Listmonk public API on marketing.lucoze.com (double opt-in, SES); gated on `PUBLIC_MARKETING_URL` (build arg, 3 places); event `Newsletter Subscribed`.

- [ ] **Step 2: PR → develop, CI green, promote to uat, cut `uat-v<next>`**

Push `feat/newsletter-subscription`; open PR to develop; wait for CI (Prettier/Jest/E2E/Semantic/Security/nginx); merge; `develop → uat`; `gh release create uat-v<next>`. **Set the UAT build-args empty** → form won't render on UAT (no engine) — that's expected; smoke still passes (envs set only in the test build).

- [ ] **Step 3: After Part A is live + owner confirms SES/DNS: prod**

Set the **prod** build-args (`PUBLIC_MARKETING_URL` + list UUID) in `build-publish.yml`; `uat → main`; `gh release create v<next>`. Then verify on live: submit a real email → confirmation arrives → confirm → subscriber shows **confirmed** in Listmonk; CSP doesn't block the POST (console clean).

---

## Self-Review (done)

- **Spec coverage:** §3 arch → A1/A4 + B2/B3; §4 Listmonk → A1–A4; §5 SubscribeForm/subscribe.ts/CSP/analytics → B1–B6; §6 data flow → A3 verify + B7 prod verify; §7 deliverability → A2 + owner notes; §8 security (honeypot/CORS/opt-in) → B1/B2 + A4; §9 out-of-scope send-on-publish → not planned (correct); §10 testing → B1/B6 + A checks; §11 owner tasks → marked [OWNER]. No gaps.
- **Placeholder scan:** no TBD/"handle errors" — every code step has full code; `[OWNER]` steps are real ops actions, not placeholders.
- **Type consistency:** `subscribe(email, placement, honeypot?)` and `isValidEmail` match across B1 (def), B2 (consumer), B6 (route stub); `PUBLIC_MARKETING_URL`/`PUBLIC_NEWSLETTER_LIST_UUID` consistent across B1/B2/B5.

## Notes
- Part B is fully buildable/testable now (mocked). Part A needs owner ops (DNS, Dokploy, SES SMTP cred). Ship B to UAT with empty build-args (form hidden) so it's merged and green; flip prod build-args on once Part A is live.
- Listmonk image pinned `v4.1.0`; confirm the public API path `/api/public/subscription` for that tag before Task A3 Step 4 / B1.
