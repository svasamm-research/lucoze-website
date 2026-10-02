// Every page in the sitemap, checked the way a visitor and Google meet it.
// The SAME file in svasamm-site, t4suite-site and lucoze-website — only site.config.ts
// differs. Reads the built sitemap, so a page added next month is tested the day it is
// added: there is no hand-kept list of pages to forget.
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { SITE } from "./site.config";

const urls = SITE.sitemaps
	.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))
	.filter((u) => !u.endsWith(".xml"));
if (urls.length === 0)
	throw new Error(`No URLs in ${SITE.sitemaps.join(", ")} — build the site first.`);

const pathOf = (u: string) => new URL(u).pathname;
const same = (u: string) => u.replace(/\/$/, "");
// Third-party noise only. Anything our own code logs as an error fails the test.
const NOISE =
	/Failed to load resource|googletagmanager|google-analytics|plausible|analytics\.lucoze|ERR_BLOCKED|net::ERR/i;

function watchErrors(page: Page) {
	const errors: string[] = [];
	page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
	page.on("console", (m) => {
		if (m.type() === "error" && !NOISE.test(m.text())) errors.push(`console: ${m.text()}`);
	});
	return errors;
}

test.describe("every page", () => {
	for (const url of urls) {
		const path = pathOf(url);
		test(`${path} — loads, one h1, canonical = sitemap, no errors`, async ({ page }) => {
			const errors = watchErrors(page);
			const res = await page.goto(path);
			expect(res?.status(), "HTTP status").toBe(200);
			await expect(page.locator("h1"), "exactly one <h1>").toHaveCount(1);
			const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
			expect(same(canonical ?? ""), "canonical must name the sitemap URL").toBe(same(url));
			const description = await page.locator('meta[name="description"]').getAttribute("content");
			expect((description ?? "").length, "meta description").toBeGreaterThan(50);
			expect(errors, "page and console errors").toEqual([]);
		});

		test(`${path} — no sideways scroll on a phone`, async ({ page }) => {
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto(path);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - window.innerWidth,
			);
			expect(overflow, "px wider than a 390px phone").toBeLessThanOrEqual(1);
		});
	}
});

test("every internal link on every page resolves", async ({ page, request }) => {
	test.setTimeout(180_000);
	const found = new Map<string, string>(); // link -> first page it was seen on
	for (const url of urls) {
		await page.goto(pathOf(url));
		const hrefs = await page.$$eval("a[href]", (as) =>
			as.map((a) => (a as HTMLAnchorElement).href),
		);
		for (const h of hrefs) {
			const u = new URL(h);
			const internal = u.origin === new URL(page.url()).origin || u.origin === SITE.origin;
			if (internal && !found.has(u.pathname)) found.set(u.pathname, pathOf(url));
		}
	}
	const broken: string[] = [];
	for (const [link, from] of found) {
		const r = await request.get(link, { maxRedirects: 5 });
		if (r.status() >= 400) broken.push(`${link} (${r.status()}) — linked from ${from}`);
	}
	expect(broken, `${found.size} internal links checked`).toEqual([]);
});

for (const f of SITE.forms) {
	test(`form on ${f.path} still has its fields`, async ({ page }) => {
		await page.goto(f.path);
		const form = page.locator(f.form);
		await expect(form).toBeVisible();
		for (const name of f.fields)
			await expect(
				form.locator(`[name="${name}"], [id="${name}"]`),
				`field "${name}"`,
			).toBeVisible();
		await expect(form.locator('button[type="submit"], input[type="submit"]')).toHaveCount(1);
	});
}
