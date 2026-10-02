// The key pages must still LOOK as approved. A moved button, a collapsed section or a
// broken layout that still "loads" fails here and nowhere else.
// Pictures are compared only on Linux, inside Playwright's own image — fonts render
// differently on a Mac, so a Mac picture would fail in CI for no real reason.
// Approve a deliberate change with: npm run test:visual:update
import { test, expect, type Page } from "@playwright/test";
import { SITE } from "./site.config";

async function settle(page: Page) {
	// Scroll to the bottom and back so lazy images load, then wait for fonts.
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 600) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 40));
		}
		window.scrollTo(0, 0);
	});
	await page.evaluate(() => document.fonts.ready);
	await page.waitForLoadState("networkidle");
}

for (const path of SITE.keyPages) {
	for (const [w, h, tag] of [
		[1366, 900, "desk"],
		[390, 844, "phone"],
	] as const) {
		test(`looks as approved: ${path} (${tag})`, async ({ page }) => {
			await page.setViewportSize({ width: w, height: h });
			await page.goto(path);
			await settle(page);
			const name = `${path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "-")}-${tag}.png`;
			await expect(page).toHaveScreenshot(name, {
				fullPage: true,
				animations: "disabled",
				mask: SITE.mask.map((s) => page.locator(s)),
				maxDiffPixelRatio: 0.01,
			});
		});
	}
}
