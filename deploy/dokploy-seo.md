# Edge SEO config (Dokploy / Traefik)

Three SEO fixes live at the TLS edge, **not** in this repo's `nginx.conf` (which
only listens on `:80` behind Dokploy's Traefik proxy):

1. **HTTP → HTTPS** redirect
2. **`www.lucoze.com` → `lucoze.com`** 301 (canonical host consolidation)
3. **HSTS** (`Strict-Transport-Security`) header

The apex `/` → `/in/` 301 is already handled in-app (`nginx.conf`, `location = /`).

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

## 2. www → apex + HSTS (Traefik middlewares)

Add these labels to the `website` service. In Dokploy: **Advanced → Docker /
Compose labels** (or edit `deploy/lucoze-website.yaml` under the service and
redeploy). Note the doubled `$$` — Docker Compose interpolates a single `$`.

```yaml
labels:
  # --- www.lucoze.com -> lucoze.com (301) ---
  - "traefik.http.middlewares.lucoze-www.redirectregex.regex=^https?://www\\.lucoze\\.com/(.*)"
  - "traefik.http.middlewares.lucoze-www.redirectregex.replacement=https://lucoze.com/$${1}"
  - "traefik.http.middlewares.lucoze-www.redirectregex.permanent=true"

  # --- HSTS (1 year, subdomains, preload) ---
  - "traefik.http.middlewares.lucoze-hsts.headers.stsSeconds=31536000"
  - "traefik.http.middlewares.lucoze-hsts.headers.stsIncludeSubdomains=true"
  - "traefik.http.middlewares.lucoze-hsts.headers.stsPreload=true"

  # --- attach both middlewares to this app's router ---
  # Replace <router> with the router name Dokploy generated for this service
  # (find it in the Traefik dashboard, usually the app/service name).
  - "traefik.http.routers.<router>.middlewares=lucoze-www,lucoze-hsts"
```

> If Dokploy manages the router name for you, prefer adding the two middlewares
> through the UI's middleware field rather than hard-coding `<router>`.

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
