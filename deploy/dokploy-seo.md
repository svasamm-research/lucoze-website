# Edge SEO config (Dokploy / Traefik)

Only **HTTP → HTTPS** + TLS/domain provisioning live at the Dokploy/Traefik edge.
**www→apex 301, HSTS, and the apex `/`→`/in/` 301 are all handled in the app's
`nginx.conf`** — Traefik forwards the real `Host` header and relays response headers
to the browser over HTTPS, so nginx does these reliably, without the Traefik-middleware
router-name guessing that proved fragile in Dokploy.

Dokploy runs [Traefik](https://doc.traefik.io/traefik/) as its reverse proxy and
provisions Let's Encrypt certs. Apply the below once per environment.

---

## 1. Domains + HTTP→HTTPS (Dokploy UI)

In the app's **Domains** tab:

1. Add domain `lucoze.com` → Container port `80` → **HTTPS: on**, Certificate: **Let's Encrypt**.
2. Add domain `www.lucoze.com` → same service, port `80`, **HTTPS: on**, Let's Encrypt.
   (Traefik needs a cert for `www` so the redirect in step 2 happens *after* TLS,
   not as a cert error.)
3. Enable **"Redirect HTTP to HTTPS"** on both domains if the toggle is present.
   If not, it's covered by the entrypoint redirect Dokploy sets by default —
   verify with `curl -I http://lucoze.com` returns `301` → `https://`.

## 2. www → apex + HSTS — handled in `nginx.conf` (NOT Traefik labels)

Originally documented as Traefik middlewares, but **Dokploy names the domain
routers itself**, so label-attached middlewares silently don't apply (the router
name never matches, and `www` is a *separate* router from the apex). Both now
live in `nginx.conf` and ship with the image:

- **www → apex:** `if ($host = www.lucoze.com) { return 301 https://lucoze.com$request_uri; }`
- **HSTS:** `add_header Strict-Transport-Security "max-age=31536000" always;`
  — host-only for now. Add `; includeSubDomains`, then later `; preload` (and submit
  to hstspreload.org), **only** once every `*.lucoze.com` (app, manager, analytics,
  status, uat…) is confirmed HTTPS-only. Both are hard to reverse.

**Action:** if you added `lucoze-www` / `lucoze-hsts` middleware labels to the Dokploy
compose, **remove them** (they don't attach — pure confusion), then rebuild + redeploy
so the new `nginx.conf` takes effect.

## 3. Verify after deploy

```bash
# HTTP -> HTTPS
curl -sI http://lucoze.com/            | grep -i '^location'   # -> https://lucoze.com/

# www -> apex (301)
curl -sI https://www.lucoze.com/in/    | grep -iE '^HTTP|^location'
#   HTTP/2 301 ... location: https://lucoze.com/in/

# HSTS present on apex
curl -sI https://lucoze.com/in/        | grep -i strict-transport-security
#   strict-transport-security: max-age=31536000; includeSubDomains; preload

# apex path redirect (in-app, already shipped)
curl -sI https://lucoze.com/           | grep -iE '^HTTP|^location'   # -> 301 /in/
```

Only submit to the [HSTS preload list](https://hstspreload.org/) once all
subdomains are confirmed HTTPS-only — `preload` + `includeSubDomains` is hard to
undo.
