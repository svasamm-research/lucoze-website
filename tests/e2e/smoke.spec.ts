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
	await expect(page.locator('form button[type="submit"], form [type="submit"]')).toBeVisible();
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

test("homepage product tour: gallery lightbox opens, navigates and closes", async ({ page }) => {
	await page.goto("/in/");
	await expect(page.locator(".tour-tile")).toHaveCount(6);
	const dialog = page.locator("#tourLightbox");
	await expect(dialog).toHaveJSProperty("open", false);

	await page.locator('[data-tour-open="lab"]').click();
	await expect(dialog).toHaveJSProperty("open", true);
	await expect(page.locator("[data-tour-counter]")).toHaveText("1 / 3");
	await expect(page.locator('[data-flow="lab"] .tour-lb__slide:not([hidden]) img')).toBeVisible();

	await page.locator("[data-tour-next]").click();
	await expect(page.locator("[data-tour-counter]")).toHaveText("2 / 3");

	await page.keyboard.press("Escape");
	await expect(dialog).toHaveJSProperty("open", false);
});

test("homepage: hero word rotator present and fonts are self-hosted", async ({ page }) => {
	await page.goto("/in/");
	await expect(page.locator(".hero .rotator").first()).toBeVisible();
	// The render-blocking Google Fonts stylesheet must be gone (self-hosted now).
	await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(0);
});
