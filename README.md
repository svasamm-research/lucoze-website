# Lucoze Website

Marketing website for the Lucoze healthcare platform at **lucoze.com**. Built with [Astro](https://astro.build/) for component reuse, static site generation, and optimal performance.

## Architecture

```
src/
├── layouts/
│   └── BaseLayout.astro       # Shared head, SEO, nav, footer, scripts
├── components/
│   ├── Nav.astro               # Navigation with country selector
│   ├── Footer.astro            # Site footer
│   ├── PricingCard.astro       # Reusable pricing card (5-tier pricing)
│   └── ComplianceBadges.astro  # Region-specific compliance badges
├── pages/                      # One .astro file per page (10 total)
├── styles/
│   └── global.css              # All styles (light/dark theme)
└── scripts/
    ├── region.js               # Country/region detection & mapping
    └── main.js                 # UI interactions (pricing, forms, theme)

public/                          # Static assets (copied to dist/ as-is)
├── images/
├── js/                          # JS served as static files
│   ├── region.js
│   └── main.js
├── robots.txt
└── sitemap.xml
```

## Pages

| Page                    | Path                     | Purpose                                              |
| ----------------------- | ------------------------ | ---------------------------------------------------- |
| Home                    | `/`                      | Hero, features, pricing (4 plans), compliance badges |
| Solutions — Clinics     | `/solutions-clinics`     | Clinic-specific features and plans                   |
| Solutions — Hospitals   | `/solutions-hospitals`   | Hospital-specific features                           |
| Solutions — Diagnostics | `/solutions-diagnostics` | Pathology/lab features (Contact Us)                  |
| Solutions — Pharmacies  | `/solutions-pharmacies`  | Pharmacy features (Contact Us)                       |
| Signup                  | `/signup`                | Free trial signup (Clinic & Hospital plans only)     |
| Contact                 | `/contact`               | Contact form                                         |
| About                   | `/about`                 | Company information                                  |
| Privacy                 | `/privacy`               | Privacy policy                                       |
| Terms                   | `/terms`                 | Terms of service                                     |

## International Pricing

5 regional pricing tiers, auto-detected by timezone:

| Region         | Currency | Detection                    | Example countries              |
| -------------- | -------- | ---------------------------- | ------------------------------ |
| India          | INR (₹)  | Asia/Kolkata                 | India                          |
| Middle East    | USD ($)  | Asia/Dubai, Asia/Riyadh      | UAE, Saudi Arabia, Qatar       |
| Southeast Asia | USD ($)  | Asia/Singapore, Asia/Jakarta | Singapore, Malaysia, Indonesia |
| Africa         | USD ($)  | Africa/Lagos, Africa/Nairobi | Nigeria, Kenya, South Africa   |
| International  | USD ($)  | Default                      | US, UK, EU, Australia          |

Country selector in the nav allows manual override. Selection persists in localStorage.

### Compliance Badges

Shown per region:

- **Middle East**: NABIDH Ready, NPHIES Compatible
- **India**: ABDM Integrated, ABHA Compatible
- **SEA**: NEHR Ready
- **All**: HL7 FHIR, ICD-10

## Tech Stack

- **Astro** — static site generator with component architecture
- **Vanilla JS** — no frontend framework (region.js + main.js)
- **Nginx** — Docker production serving (multi-stage build)
- **Jest + jsdom** — 53 unit tests
- **Prettier** — formatting (with Astro plugin)
- **Husky + commitlint** — git hooks

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
npm install
```

### Running locally

```bash
npm run dev          # Astro dev server (http://localhost:4321)
npm run build        # Build to dist/
npm run preview      # Preview built site
```

> **Note:** The signup and contact forms call the lucoze_admin API. On localhost they automatically point to `http://lucoze.admin.localhost:8000`.

### Running tests

```bash
npm test                # 53 Jest tests
npm run test:coverage   # with coverage report
```

### Formatting

```bash
npm run lint     # check formatting (Prettier)
npm run format   # auto-fix formatting
```

### Docker build (local)

```bash
docker build -t lucoze-website:local .
docker run --rm -p 8080:80 lucoze-website:local
# Open http://localhost:8080
```

---

## Branching Strategy

```
main      ← production (lucoze.com). Only merged from uat.
  ↑
uat       ← staging (uat-website.lucoze.com). Merged from develop.
  ↑
develop   ← integration. All feature PRs merge here.
  ↑
feature/my-change
```

Deployments are triggered by GitHub Releases — never by branch pushes.

---

## Deployment

### CI/CD (GitHub Actions)

| Release tag  | Docker tags                 | Environment                |
| ------------ | --------------------------- | -------------------------- |
| `uat-vX.Y.Z` | `uat-vX.Y.Z` + `uat-latest` | UAT                        |
| `vX.Y.Z`     | `vX.Y.Z` + `latest`         | Production (approval gate) |

### Required GitHub secrets

| Secret                               | Purpose                      |
| ------------------------------------ | ---------------------------- |
| `DOCKERHUB_USERNAME`                 | Docker Hub login             |
| `DOCKERHUB_TOKEN`                    | Docker Hub read+write token  |
| `DOKPLOY_LUCOZE_WEBSITE_WEBHOOK`     | Dokploy webhook — production |
| `DOKPLOY_LUCOZE_WEBSITE_UAT_WEBHOOK` | Dokploy webhook — UAT        |

Variable: `DOKPLOY_DEPLOY_ENABLED=true`

---

## Related Repositories

| Repo                                                               | Purpose                                   |
| ------------------------------------------------------------------ | ----------------------------------------- |
| [lucoze](https://github.com/svasamm-research/lucoze)               | Tenant app — healthcare management        |
| [lucoze-admin](https://github.com/svasamm-research/lucoze-admin)   | SaaS admin portal — provisioning, billing |
| [lucoze-agent](https://github.com/svasamm-research/lucoze-agent)   | Provisioning agent and manager route API  |
| [frappe_docker](https://github.com/svasamm-research/frappe_docker) | Docker infrastructure for Frappe apps     |
