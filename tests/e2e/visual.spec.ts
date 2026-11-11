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
	// An Astro island (the home page's ROI calculator, client:visible) starts only once it is seen,
	// and re-lays its section out when it does. The quick scroll above sometimes passed it unseen, so
	// a run caught it not started, started, or starting DURING the picture: the dropdown's mask was
	// measured 320 px from where the dropdown then stood and two pictures never matched (the 9 Nov
	// Monday rebuild, uat-v4.22.0 and uat-v4.22.1, 10 Nov 2026). So bring each island into view and
	// wait until Astro has removed its `ssr` attribute (it does once the island has started).
	// (Every island, by position: a locator on [ssr] would shift as each one starts.)
	for (const island of await page.locator("astro-island").all()) {
		await island.scrollIntoViewIfNeeded();
		await expect(island).not.toHaveAttribute("ssr", /.*/, { timeout: 15_000 });
	}
	await page.evaluate(() => window.scrollTo(0, 0));
	// THE cause of the red releases (10 Nov 2026): the site scrolls smoothly (tokens.css), so a
	// scrollTo is an animation, and the picture began while the page was still gliding back up:
	// the sticky header was drawn 3,700 px down the first picture. The test asks for reduced
	// motion (the site then scrolls at once, as it does for any visitor who asks) and waits for 0.
	await page.waitForFunction(() => window.scrollY === 0);
	await page.evaluate(
		() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
	);
}

for (const path of SITE.keyPages) {
	for (const [w, h, tag] of [
		[1366, 900, "desk"],
		[390, 844, "phone"],
	] as const) {
		test(`looks as approved: ${path} (${tag})`, async ({ page }) => {
			await page.setViewportSize({ width: w, height: h });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(path);
			await settle(page);
			// Things that MOVE by design (a cycling word, a button that floats in) are hidden:
			// a mask box follows its element, so a moving element moves its mask too.
			const hide = (SITE as { hide?: string[] }).hide ?? [];
			if (hide.length)
				await page.addStyleTag({ content: `${hide.join(",")}{visibility:hidden !important}` });
			// CSS that makes a rendering repeatable (see SITE.css in site.config.ts).
			const css = (SITE as { css?: string }).css;
			if (css) await page.addStyleTag({ content: css });
			const name = `${path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "-")}-${tag}.png`;
			await expect(page).toHaveScreenshot(name, {
				fullPage: true,
				animations: "disabled",
				mask: SITE.mask.map((s) => page.locator(s)),
				maxDiffPixels: 100,
			});
		});
	}
}
