// lucoze.com's own checks (30 Oct 2026). Sales mail moved from sales@lucoze.com to
// sales@svasamm.com and the Book-a-demo form broke: the Lambda still mailed the old address.
// These keep the site, the Lambda's defaults and the footer on ONE address.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { SALES_EMAIL } from "../../src/data/contact";
import { SITE } from "./site.config";

const urls = SITE.sitemaps
	.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))
	.filter((u) => !u.endsWith(".xml"));

test("sales mail is sales@svasamm.com on every page and in llms.txt", async ({ page }) => {
	expect(SALES_EMAIL).toBe("sales@svasamm.com");
	const bad: string[] = [];
	for (const u of urls) {
		const html = await (await page.request.get(u)).text();
		if (/sales@lucoze\.com/i.test(html)) bad.push(u);
	}
	expect(bad).toEqual([]);
	expect(readFileSync("public/llms.txt", "utf8")).not.toMatch(/sales@lucoze\.com/i);
});

test("the lead-form Lambda mails the same address the site shows", () => {
	const src = readFileSync("aws/lead-form/index.mjs", "utf8");
	expect(src).toContain(`process.env.MAIL_TO || "${SALES_EMAIL}"`);
	expect(src).toContain('process.env.MAIL_FROM || "no-reply@svasamm.com"');
});

test("the footer says Lucoze is a Svasamm product", async ({ page }) => {
	await page.goto("/in/");
	const line = page.locator("footer", { hasText: "A Svasamm product by" });
	await expect(line).toBeVisible();
	await expect(line.locator('a[href="https://svasamm.com"]')).toHaveText("Svasamm Research");
});
