# Lucoze Website

Marketing website for the Lucoze healthcare platform at **lucoze.com**. Static HTML/CSS/JS site — no build step, no framework.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, features, pricing plans |
| Solutions — Clinics | `solutions-clinics.html` | Clinic-specific features |
| Solutions — Hospitals | `solutions-hospitals.html` | Hospital-specific features |
| Solutions — Diagnostics | `solutions-diagnostics.html` | Pathology/lab features |
| Solutions — Pharmacies | `solutions-pharmacies.html` | Pharmacy features |
| Signup | `signup.html` | Free trial signup (Clinic & Hospital plans only) |
| Contact | `contact.html` | Contact form (Pathology, Pharmacy, and general enquiries) |
| About | `about.html` | Company information |
| Privacy | `privacy.html` | Privacy policy |
| Terms | `terms.html` | Terms of service |

## Tech Stack

- Plain HTML, CSS, JavaScript (no framework, no build step)
- Nginx (Docker) for serving in production
- Jest + jsdom for unit tests
- Prettier for formatting
- Husky + commitlint for git hooks

---

## Developer Onboarding

### Prerequisites

- Node.js 18+
- npm
- Docker (for local build verification)

### Setup

```bash
git clone git@github.com:svasamm-research/lucoze-website.git
cd lucoze-website
npm install        # installs dev dependencies and sets up Husky git hooks
```

### Running the site locally

No build step needed — open any HTML file directly in your browser, or use a local server:

```bash
npx serve .        # serves on http://localhost:3000
# or
python3 -m http.server 8080
```

> **Note:** The signup and contact forms call the lucoze_admin API. On localhost they automatically point to `http://lucoze.admin.localhost:8000`. Set up the lucoze_admin bench locally to test the full flow.

### Running tests

```bash
npm test                # run all Jest tests
npm run test:coverage   # run with coverage report (50% threshold enforced)
```

Tests live in `tests/main.test.js` and cover the JavaScript utility functions in `js/main.js`.

### Formatting

```bash
npm run lint     # check formatting (Prettier)
npm run format   # auto-fix formatting
```

Prettier checks `**/*.{js,css,html,json}`. Run `format` before committing if you get lint failures.

### Docker build (local)

```bash
# Build
docker build -t lucoze-website:local .

# Run and verify
docker run --rm -p 8080:80 lucoze-website:local
# Open http://localhost:8080
```

---

## Git Hooks (Husky)

| Hook | Runs on | What it does |
|------|---------|-------------|
| `pre-commit` | Every commit | Blocks commits to `main`/`develop`; runs Prettier check |
| `commit-msg` | Every commit | Validates Conventional Commits format |
| `pre-push` | Every push | Runs Jest test suite + Docker build verification |

The pre-push Docker build check catches issues (e.g. referencing files not tracked in git) before they reach CI.

---

## Branching Strategy

```
main      ← production-ready. Only merged from uat.
  ↑
  │  merge + Release tagged vX.Y.Z        → Production deploy
  │
uat       ← staging. Cherry-picked or merged from develop.
  ↑
  │  Release tagged uat-vX.Y.Z            → UAT deploy
  │
develop   ← integration branch. All feature PRs merge here.
  ↑
feature/my-change
```

**Deployments are triggered by GitHub Releases — never by branch pushes.**

### Day-to-day workflow

```bash
# 1. Branch from develop
git checkout develop && git pull
git checkout -b feat/my-change

# 2. Make changes, commit (Conventional Commits format required)
git commit -m "feat: add hospital pricing card"

# 3. Push and open PR to develop
git push origin feat/my-change
# CI: Prettier + Jest run automatically

# 4. After PR is merged to develop, promote to UAT
git checkout uat && git merge origin/develop
git push origin uat

# 5. Create a GitHub Release on uat branch, tag uat-v1.2.0
#    → CI builds Docker image → deploys to uat-website.lucoze.com

# 6. After UAT testing, merge to main and release
git checkout main && git merge origin/uat
git push origin main
# Create Release on main, tag v1.2.0
# → CI builds Docker image → deploys to lucoze.com (requires approval)
```

---

## Deployment

The website is containerised as a static Nginx image and deployed via Dokploy on the Lucoze infrastructure.

### CI/CD (GitHub Actions)

Workflow: `.github/workflows/build-publish.yml`

| Release tag | Docker tags pushed | Environment |
|-------------|-------------------|-------------|
| `uat-vX.Y.Z` | `uat-vX.Y.Z` + `uat-latest` | UAT (`uat-website.lucoze.com`) |
| `vX.Y.Z` | `vX.Y.Z` + `latest` | Production (`lucoze.com`) — requires approval |

### Generating the Dokploy compose YAML (one-time setup)

```bash
# Copy the env template and fill in your infrastructure values
cp deploy/lucoze-website.env.example /tmp/lucoze-website.env
# Edit /tmp/lucoze-website.env — set AGENT_PRIVATE_IP and BENCH_PORT

# Generate the final compose YAML
docker compose \
  --env-file /tmp/lucoze-website.env \
  -f deploy/lucoze-website.yaml \
  config > /tmp/lucoze-website-final.yaml

# Upload /tmp/lucoze-website-final.yaml to the Dokploy project via the UI
```

Use `deploy/lucoze-website-uat.yaml` + `deploy/lucoze-website-uat.env.example` for the UAT compose.

> **Never commit the filled-in env files** — they contain infrastructure details. Only the `.env.example` templates are committed.

### Required GitHub secrets

| Secret | Purpose |
|--------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub login |
| `DOCKERHUB_TOKEN` | Docker Hub read+write token |
| `DOKPLOY_LUCOZE_WEBSITE_WEBHOOK` | Dokploy redeploy webhook — production |
| `DOKPLOY_LUCOZE_WEBSITE_UAT_WEBHOOK` | Dokploy redeploy webhook — UAT |

GitHub Variable: `DOKPLOY_DEPLOY_ENABLED=true` to enable auto-deploy after build.

---

## Related Repositories

| Repo | Purpose |
|------|---------|
| [lucoze](https://github.com/svasamm-research/lucoze) | Tenant app — Frappe healthcare customizations |
| [lucoze_admin](https://github.com/svasamm-research/lucoze_admin) | SaaS admin portal — tenant management, billing, provisioning |
| [frappe_docker](https://github.com/svasamm-research/frappe_docker) | Docker infrastructure for Frappe app deployments |
