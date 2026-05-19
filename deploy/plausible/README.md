# Plausible Analytics — Self-hosted Deployment

Self-hosted Plausible CE for `analytics.lucoze.com`. Tracks anonymous, aggregate visitor analytics for `lucoze.com` (and any other domain we add later).

## Architecture

- **Host**: Manager VPS (alongside Dokploy + Traefik)
- **Stack**: Plausible (Phoenix) + Postgres 16 (config) + ClickHouse 24.12 (event store)
- **Routing**: Traefik on Manager → `analytics.lucoze.com` → plausible:8000
- **Network**: joins existing `dokploy-network` so Traefik can route

## Prerequisites

1. **DNS**: `analytics.lucoze.com` resolves to Manager VPS public IP. Either the existing `*.lucoze.com` wildcard (if it already points at Manager), or an explicit `analytics.lucoze.com` A-record. Verify with `dig +short analytics.lucoze.com`.
2. **Manager VPS RAM**: 8 GB recommended. Works on 4 GB with the existing ClickHouse limits in `clickhouse/clickhouse-user-config.xml`.
3. **AWS SES SMTP credentials**: created under the Svasamm Research AWS account (us-east-1). The `lucoze.com` domain is DKIM-verified and SES is out of sandbox, so Plausible can send invites and password resets to any external address. Generate dedicated SMTP creds (IAM user e.g. `lucoze-plausible-smtp`) from SES → SMTP settings; the username and password go into `plausible.env`.

## First-time deploy

```bash
# 1. On the Manager VPS, prepare env file
cp deploy/plausible/plausible.env.example /tmp/plausible.env

# 2. Generate secrets
# SECRET_KEY_BASE and TOTP_VAULT_KEY are Phoenix/Erlang secrets — base64 is fine.
# POSTGRES_PASSWORD and CLICKHOUSE_PASSWORD are embedded into URLs — use hex to
# avoid '/' '+' '=' that would break URL parsing.
echo "SECRET_KEY_BASE=$(openssl rand -base64 64 | tr -d '\n')"
echo "TOTP_VAULT_KEY=$(openssl rand -base64 32 | tr -d '\n')"
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "CLICKHOUSE_PASSWORD=$(openssl rand -hex 24)"
# Paste into /tmp/plausible.env; fill SMTP creds from AWS SES console.

# 3. Materialise final compose
docker compose \
  --env-file /tmp/plausible.env \
  -f deploy/plausible/docker-compose.yml \
  config > /tmp/plausible-final.yaml

# 4. In Dokploy UI:
#    - Create new project: "Plausible-Analytics"
#    - Service type: Docker Compose
#    - Paste /tmp/plausible-final.yaml
#    - Deploy
```

## Bootstrap the first admin (CLI)

Registration is `invite_only`, so the very first user must be created via CLI on the Manager VPS. After that, the admin invites teammates from the dashboard and SES delivers the invite emails.

```bash
# Find the running plausible container
docker ps | grep plausible

# Create the first admin
docker exec -it <plausible-container> /entrypoint.sh user create \
  --email admin@lucoze.com \
  --name "Lucoze Admin" \
  --password "<strong-password>"
```

Then log into `https://analytics.lucoze.com` and:
1. Add site → `lucoze.com`
2. Invite the GTM lead and any other teammate from **Settings → Team** — the invite arrives by email via SES.

## Verify

```bash
# DNS
dig +short analytics.lucoze.com
# Should return Manager VPS IP

# Cert (after Traefik issues it, may take 30-60s on first request)
curl -I https://analytics.lucoze.com
# Expect: HTTP/2 200 with valid Let's Encrypt cert

# Health
curl https://analytics.lucoze.com/api/health
# Expect: {"ok":"yes"}
```

## Operational notes

- **Backups**: snapshot the `db-data` and `event-data` volumes nightly. Postgres holds users/sites/settings; ClickHouse holds raw events. Both are needed for restore.
- **Memory limits**: ClickHouse capped at 2 GB (`clickhouse-user-config.xml`). After the Manager VPS upgrade to 8 GB, this is safe; revisit if event ingestion grows past ~100K pv/day.
- **Logs**: ClickHouse internal logging tables are disabled to prevent disk bloat on the shared Manager VPS. Re-enable in `clickhouse-config.xml` if debugging.
- **Updates**: bump the image tag in `docker-compose.yml`, redeploy in Dokploy. Plausible release notes: <https://github.com/plausible/community-edition/releases>

## Pairing with the website

The lucoze-website's `BaseLayout.astro` loads `https://analytics.lucoze.com/js/script.js` for any non-DEV build. To prevent UAT traffic polluting production stats, the `data-domain` is set per-environment via the `PUBLIC_PLAUSIBLE_DOMAIN` Astro build-arg (see lucoze-website root `Dockerfile`). Leave it unset on UAT builds to skip Plausible loading entirely; set to `lucoze.com` on production builds.
