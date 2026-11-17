import { test, expect } from "@playwright/test";

// ABDM and HFR readers (Mithun, 17 Nov 2026): Lucoze wants clinic and hospital clients, not HFR help
// requests, so an ABDM post's sidebar and closing band name the software and lead to the demo and
// the two solutions pages. A demo click is counted by Base.astro's "Demo CTA Click" with the page.
test("an ABDM post leads to the demo and the clinic and hospital pages, not ABDM help", async ({
	page,
}) => {
	await page.goto("/in/blog/hfr-login/");
	await expect(page.locator("[data-blog-cta]")).toHaveCount(4);
	await expect(page.locator('[data-blog-cta="sidebar"]')).toHaveAttribute("href", "/in/demo/");
	await expect(page.locator('[data-blog-cta="band"]')).toHaveAttribute("href", "/in/demo/");
	await expect(page.locator('[data-blog-cta="clinics"]')).toHaveAttribute(
		"href",
		"/in/solutions/clinics/",
	);
	await expect(page.locator('[data-blog-cta="hospitals"]')).toHaveAttribute(
		"href",
		"/in/solutions/hospitals/",
	);
	await expect(page.locator('main a[href="/in/abdm-readiness/"]')).toHaveCount(0);
});
