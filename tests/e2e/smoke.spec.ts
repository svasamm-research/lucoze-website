import { test, expect } from "@playwright/test";

/**
 * App-level smoke tests. Each one guards a regression we've actually shipped:
 * a silently-broken island, mobile overflow, a dead lead form, blog paragraphs
 * fragmenting after links, pages 404-ing, and the wrong fonts loading.
 */

test("homepage: ROI calculator renders its controls", async ({ page }) => {
	// The calculator is a client:visible React island but is server-rendered,
	// so its controls exist in the HTML immediately — no scroll/hydration needed.
	// This is the exact "the ROI calculator disappeared" regression.
	await page.goto("/in/");
	const roi = page.locator("#roi .roi");
	await expect(roi).toBeVisible();
	await expect(page.locator("#roi-specialty")).toBeVisible();
	await expect(page.locator('#roi input[type="range"]')).toHaveCount(4);
	// results panel should show computed values, not be empty
	await expect(page.locator("#roi")).toContainText("/mo");
});

test("homepage: no horizontal overflow at 360px", async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto("/in/");
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);
});

test("demo page: lead form renders with its fields and a submit button", async ({ page }) => {
	await page.goto("/in/demo/");
	await expect(page.locator("#c-name")).toBeVisible();
	await expect(page.locator("#c-phone")).toBeVisible();
	await expect(page.locator("#c-email")).toBeVisible();
	// Scoped to the lead form (has #c-name) — the footer's newsletter subscribe
	// form on this page has its own submit button and would otherwise match too.
	const leadForm = page.locator("form", { has: page.locator("#c-name") });
	await expect(leadForm.locator('button[type="submit"], [type="submit"]')).toBeVisible();
});

test("key routes return 200 and have an <h1>", async ({ page }) => {
	const routes = [
		"/in/",
		"/in/pricing/",
		"/in/specialties/dental/",
		"/in/locations/kolkata/",
		"/in/blog/abdm-abha-guide/",
	];
	for (const route of routes) {
		const res = await page.goto(route);
		expect(res?.status(), `${route} status`).toBe(200);
		await expect(page.locator("h1").first(), `${route} h1`).toBeVisible();
	}
});

test("blog post renders as clean paragraphs (no fragmented <p>, inline links)", async ({
	page,
}) => {
	await page.goto("/in/blog/abdm-abha-guide/");
	// The nested-<p> bug wrapped text runs in their own block <p> inside <p>/<li>,
	// breaking inline links onto new lines. These must all be zero.
	await expect(page.locator(".post p p")).toHaveCount(0);
	await expect(page.locator(".post li > p")).toHaveCount(0);
	await expect(page.locator(".post a > p")).toHaveCount(0);
	// and a body paragraph should contain an inline link (proves links stay inline)
	await expect(page.locator(".post p a").first()).toBeVisible();
});

test("feature page gallery: lightbox opens, navigates, closes on Esc + outside click", async ({
	page,
}) => {
	// Galleries live on feature/solutions pages now, not the homepage.
	await page.goto("/in/features/lab/");
	const dialog = page.locator("#galleryLightbox");
	await expect(dialog).toHaveJSProperty("open", false);

	await page.locator('[data-gallery-open="lab"]').click();
	await expect(dialog).toHaveJSProperty("open", true);
	await expect(page.locator("[data-gallery-counter]")).toHaveText("1 / 3");
	await expect(
		page.locator('[data-flow="lab"] .gallery-lb__slide:not([hidden]) img'),
	).toBeVisible();

	await page.locator("[data-gallery-next]").click();
	await expect(page.locator("[data-gallery-counter]")).toHaveText("2 / 3");

	await page.keyboard.press("Escape");
	await expect(dialog).toHaveJSProperty("open", false);

	// Clicking outside the image (top-left of the inner backdrop) also closes.
	await page.locator('[data-gallery-open="lab"]').click();
	await expect(dialog).toHaveJSProperty("open", true);
	await page.locator("[data-gallery-inner]").click({ position: { x: 8, y: 8 } });
	await expect(dialog).toHaveJSProperty("open", false);
});

test("blog index: category filter and sort work", async ({ page }) => {
	await page.goto("/in/blog/");
	const cards = page.locator(".blog-card");
	const total = await cards.count();
	expect(total).toBeGreaterThan(3);

	// filter to Compliance → fewer visible, all in that category
	await page.locator('[data-filter="Compliance"]').click();
	const visible = page.locator(".blog-card:visible");
	await expect(visible.first()).toBeVisible();
	const visN = await visible.count();
	expect(visN).toBeGreaterThan(0);
	expect(visN).toBeLessThan(total);

	// back to all + sort oldest → first card differs from newest order
	await page.locator('[data-filter="all"]').click();
	const firstNewest = await page.locator(".blog-card").first().getAttribute("data-date");
	await page.locator("[data-blog-sort]").selectOption("oldest");
	const firstOldest = await page.locator(".blog-card").first().getAttribute("data-date");
	expect(Number(firstOldest)).toBeLessThan(Number(firstNewest));
});

test("homepage: hero word rotator present and fonts are self-hosted", async ({ page }) => {
	await page.goto("/in/");
	await expect(page.locator(".hero .rotator").first()).toBeVisible();
	// The render-blocking Google Fonts stylesheet must be gone (self-hosted now).
	await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(0);
});

test("newsletter: subscribe form renders and submits (mocked)", async ({ page }) => {
	// SubscribeForm renders only when PUBLIC_MARKETING_URL is set at build —
	// playwright.config.ts webServer.command sets fake build envs for this.
	// Stub the Listmonk call so no real network/opt-in happens.
	await page.route("**/api/public/subscription", (route) =>
		route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
	);
	await page.goto("/in/blog/");
	const form = page.locator("form[data-subscribe]").first();
	await expect(form).toBeVisible();
	await form.locator('input[type="email"]').fill("reader@clinic.com");
	await form.locator("button[type=submit]").click();
	await expect(form.locator(".subscribe__note")).toContainText("confirm your subscription");

	// Mobile: no horizontal overflow after the form is present in the page.
	await page.setViewportSize({ width: 360, height: 800 });
	await page.reload();
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);
});
