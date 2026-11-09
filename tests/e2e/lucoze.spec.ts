// lucoze.com's own checks (30 Oct 2026). Sales mail moved from sales@lucoze.com to
// sales@svasamm.com and the Book-a-demo form broke: the Lambda still mailed the old address.
// These keep the site, the Lambda's defaults and the footer on ONE address.
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { FOUNDER_EMAIL, SALES_EMAIL, SUPPORT_EMAIL } from "../../src/data/contact";
import { SITE } from "./site.config";

const urls = SITE.sitemaps
	.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))
	.filter((u) => !u.endsWith(".xml"));

test("sales, help and founder mail are on svasamm.com on every page and in llms.txt", async ({
	page,
}) => {
	expect([SALES_EMAIL, SUPPORT_EMAIL, FOUNDER_EMAIL]).toEqual([
		"sales@svasamm.com",
		"query@svasamm.com",
		"mithun@svasamm.com",
	]);
	const bad: string[] = [];
	for (const u of urls) {
		// the PATH, so it hits the local build — an absolute sitemap URL would fetch production
		const html = await (await page.request.get(new URL(u).pathname)).text();
		if (/(sales|support|mithun)@lucoze\.com/i.test(html)) bad.push(u);
	}
	expect(bad).toEqual([]);
	expect(readFileSync("public/llms.txt", "utf8")).not.toMatch(
		/(sales|support|mithun)@lucoze\.com/i,
	);
});

test("the plain-JS error text names the help address", () => {
	const js = readFileSync("public/js/main.js", "utf8");
	expect(js).toContain(SUPPORT_EMAIL);
	expect(js).not.toMatch(/support@lucoze\.com/i);
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

// The lead form's real path, against a stand-in for the Lambda.
async function submitDemo(page: Page, headers: Record<string, string>) {
	let posted: Record<string, unknown> | null = null;
	await page.route("https://lead.test/**", async (r) => {
		posted = r.request().postDataJSON();
		await r.fulfill({ status: 200, contentType: "application/json", headers, body: '{"ok":true}' });
	});
	await page.goto("/in/demo/");
	await page.fill("#c-name", "Testing");
	await page.fill("#c-phone", "9830012345");
	await page.locator("[data-contact-submit]").click();
	return () => posted;
}

test("Book a demo posts the lead and shows success when the answer names this page", async ({
	page,
	baseURL,
}) => {
	const posted = await submitDemo(page, {
		"access-control-allow-origin": new URL(baseURL!).origin,
	});
	await expect(page.locator("[data-contact-success]")).toBeVisible();
	expect(posted()).toMatchObject({ name: "Testing", phone: "9830012345", source: "contact" });
});

test("Book a demo says it could not reach the server when the answer names another address", async ({
	page,
}) => {
	await submitDemo(page, { "access-control-allow-origin": "https://not-this-page.example" });
	await expect(page.locator("[data-contact-error]")).toContainText("Couldn't reach the server");
	await expect(page.locator("[data-contact-error]")).toContainText(SALES_EMAIL);
});

test("every specialty is listed on the specialties page", async ({ page }) => {
	await page.goto("/in/specialties/");
	const slugs = [
		...readFileSync("dist/sitemap-0.xml", "utf8").matchAll(
			/\/in\/specialties\/([a-z-]+)\/<\/loc>/g,
		),
	].map((m) => m[1]);
	expect(slugs.length).toBeGreaterThan(0);
	for (const slug of slugs)
		await expect(page.locator(`main a[href="/in/specialties/${slug}/"]`)).toHaveCount(1);
});

// One AI-crawler rule on all three sites (Mithun, 9 Nov 2026): every AI bot, training as well as
// search, may read the whole site. A named group replaces "*" for that bot, so check the bot's own group.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];
test("robots.txt lets every AI crawler read the site", async ({ request }) => {
  const text = await (await request.get("/robots.txt")).text();
  const groups: { agents: string[]; rules: string[] }[] = [];
  let open = false;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (!m) continue;
    const [k, v] = [m[1].toLowerCase(), m[2].trim()];
    if (k === "user-agent") {
      if (!open) groups.push({ agents: [], rules: [] });
      groups[groups.length - 1].agents.push(v.toLowerCase());
      open = true;
    } else if (k === "allow" || k === "disallow") {
      if (groups.length) groups[groups.length - 1].rules.push(`${k}:${v}`);
      open = false;
    }
  }
  for (const bot of AI_BOTS) {
    const g = groups.find((x) => x.agents.includes(bot.toLowerCase()));
    expect(g, `${bot} is named`).toBeTruthy();
    expect(g!.rules, bot).toContain("allow:/");
    expect(g!.rules, bot).not.toContain("disallow:/");
  }
});
