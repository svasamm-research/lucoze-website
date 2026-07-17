# Protecting the UAT site (uat-website.lucoze.com)

**Answer to "have we no-indexed UAT?"** — **No, not yet.** The `robots.txt` in the image
is prod-focused (allows crawling, points to `https://lucoze.com/sitemap-index.xml`), and
every page's `<link rel="canonical">` points at **lucoze.com**. Canonicals *reduce* the risk
of UAT being indexed as duplicate content, but they don't *prevent* crawling. UAT should be
locked down.

The cleanest fix is **HTTP Basic Auth (htpasswd) at the Traefik edge** — it blocks crawlers
*and* casual visitors in one step (a bot that can't load the page can't index it), so it
covers both "no-index" and "keep it private". Do this at the UAT domain only; leave prod open.

> This is an **edge** change (Dokploy/Traefik), not an app/code change — the same image
> serves prod and UAT, so environment-specific behaviour must live at the proxy, not baked
> into the static build.

---

## Option A — Basic Auth on UAT (recommended)

**1. Generate a bcrypt htpasswd line** (username `uat`, pick a strong password):

```bash
htpasswd -nbB uat 'YOUR_STRONG_PASSWORD'
# -> uat:$2y$05$abcd…   (copy the whole line)
```
No `htpasswd`? Use: `docker run --rm httpd:2.4 htpasswd -nbB uat 'YOUR_STRONG_PASSWORD'`

**2a. Preferred — Dokploy UI:** open the **UAT** app → its **Domain** for `uat-website.lucoze.com`
→ look for a **Basic Auth / Security** option and paste the `user:hash` line. (Dokploy exposes
this on newer versions.)

**2b. If no UI option — Traefik middleware.** UAT is served through the manager-VPS Traefik
(file provider), where router config *does* apply (unlike the prod remote-server label issue
we hit earlier). Add to that Traefik dynamic config and attach to the UAT router:

```yaml
http:
  middlewares:
    uat-auth:
      basicAuth:
        users:
          - "uat:$2y$05$abcd…"      # from step 1
  routers:
    <uat-website-router>:            # the router serving uat-website.lucoze.com
      middlewares:
        - uat-auth
```
> In a docker-compose label (not a file), escape every `$` as `$$`.

**3. Verify:**
```bash
curl -sI https://uat-website.lucoze.com/in/            # -> 401 Unauthorized
curl -sI -u uat:YOUR_STRONG_PASSWORD https://uat-website.lucoze.com/in/   # -> 200
```

## Option B — noindex header (only if UAT must stay open, no password)

If you need UAT reachable without a login but not indexed, add an `X-Robots-Tag` response
header on the UAT router instead of (or in addition to) auth:

```yaml
http:
  middlewares:
    uat-noindex:
      headers:
        customResponseHeaders:
          X-Robots-Tag: "noindex, nofollow"
  routers:
    <uat-website-router>:
      middlewares:
        - uat-noindex
```
Verify: `curl -sI https://uat-website.lucoze.com/in/ | grep -i x-robots-tag`
→ `x-robots-tag: noindex, nofollow`.

**Recommendation:** use **Option A (Basic Auth)** for UAT. It's the standard staging lock and
also keeps work-in-progress private. Keep prod (`lucoze.com`) fully open. Belt-and-suspenders:
you can apply both A and B to UAT.
