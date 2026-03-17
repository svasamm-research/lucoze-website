# Lucoze Website

Marketing website for the Lucoze healthcare platform at **lucoze.com**. Static HTML/CSS/JS site with no build step or framework dependencies.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, features, pricing plans, testimonials |
| Solutions — Clinics | `solutions-clinics.html` | Clinic-specific features and benefits |
| Solutions — Hospitals | `solutions-hospitals.html` | Hospital-specific features and benefits |
| Solutions — Diagnostics | `solutions-diagnostics.html` | Pathology/lab-specific features |
| Solutions — Pharmacies | `solutions-pharmacies.html` | Pharmacy-specific features |
| Signup | `signup.html` | Free trial signup for Clinic and Hospital plans |
| Contact | `contact.html` | Contact form (routes to admin portal API) |
| About | `about.html` | Company information |
| Privacy | `privacy.html` | Privacy policy |
| Terms | `terms.html` | Terms of service |

## Tech Stack

- Plain HTML, CSS, JavaScript (no framework, no build step)
- Jest for testing (jsdom environment)
- Prettier for formatting
- Husky + commitlint for git hooks

## Developer Onboarding

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd lucoze-website
npm install
```

This automatically sets up Husky git hooks via the `prepare` script.

### Running tests

```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report (50% threshold)
```

### Formatting

```bash
npm run lint     # Check formatting
npm run format   # Auto-fix formatting
```

### Git hooks

| Hook | What it does |
|------|-------------|
| `pre-commit` | Blocks commits to main/develop, runs Prettier check |
| `pre-push` | Runs Jest test suite |
| `commit-msg` | Validates commit message format (Conventional Commits) |

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code (protected) |
| `develop` | Integration branch (protected) |
| `uat` | Staging/UAT |

All changes go through feature branches from `develop` → PR → merge.

## Deployment

Static site served via Nginx on the Lucoze Manager VPS. No build step required — deploy by syncing files.

## Related Repositories

| Repo | Purpose |
|------|---------|
| [lucoze](https://github.com/svasamm-research/lucoze) | Tenant app — healthcare management |
| [lucoze_admin](https://github.com/svasamm-research/lucoze_admin) | SaaS admin portal — tenant management, billing |

## License

MIT
