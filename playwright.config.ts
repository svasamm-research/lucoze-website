import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests — run against the real built site via `astro preview`.
 *
 * These guard the app-level regressions we've actually shipped: an island that
 * silently stops rendering, mobile horizontal overflow, a broken lead form,
 * blog paragraphs fragmenting, and pages 404-ing. They run pre-push and in CI
 * (both gates). nginx-level behaviour (301 redirects, CSP headers) is checked
 * separately by scripts/check-nginx.sh, since `astro preview` doesn't apply it.
 */
export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 30_000,
	expect: { timeout: 5_000 },
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://localhost:4321",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	// Build (if needed) and serve the static output. `astro preview` serves the
	// real dist, so tests hit the same HTML/JS that ships.
	webServer: {
		// PUBLIC_MARKETING_URL / PUBLIC_NEWSLETTER_LIST_UUID are build-time envs —
		// SubscribeForm renders nothing without them (see src/components/SubscribeForm.astro).
		// Set fake values so the newsletter smoke test has a form to find; the
		// actual Listmonk call is stubbed in the test via page.route().
		command:
			"PUBLIC_MARKETING_URL=https://marketing.lucoze.com PUBLIC_NEWSLETTER_LIST_UUID=test-uuid npm run build && npm run preview",
		url: "http://localhost:4321/in/",
		timeout: 120_000,
		reuseExistingServer: !process.env.CI,
	},
});
