// What differs per site. site.spec.ts and visual.spec.ts are the SAME files in
// svasamm-site, t4suite-site and lucoze-website — change them in all three.
// (Lucoze serves with `astro preview`, so it needs no static-server.mjs.)
export const SITE = {
	origin: "https://lucoze.com",
	built: "dist",
	sitemaps: ["dist/sitemap-0.xml"],
	keyPages: ["/in/", "/in/solutions/hospitals/", "/in/pricing/", "/in/features/", "/in/contact/"],
	forms: [] as { path: string; form: string; fields: string[] }[], // the lead form is covered in smoke.spec.ts
	// Hidden in screenshots because they MOVE by design: .rotator (the hero's cycling word)
	// and .wa-fab (the WhatsApp button that floats in). On GitHub's slower runners they were
	// caught mid-motion (8 Oct 2026, up to 6,737 px) — hidden by the old 1% allowance.
	hide: [".rotator", ".wa-fab"] as string[],
	// Native <select>s can render a pixel up or down between identical runs (svasamm-site,
	// 8 Oct 2026, 401 px on its contact form); masked so the 100-px allowance stays honest.
	mask: ["select"] as string[],
	// A blur is not repeatable on GitHub's runners: the sticky header's translucent, blurred
	// background (backdrop-filter) came out up to 1/255 different between attempts of the SAME page,
	// over ~93,000 pixels in the top 73 px. The v4.21.0 production release stopped on it
	// (3 Nov 2026) though uat-v4.21.0, the identical code, passed. The picture is taken with the
	// blur off; the page itself is unchanged.
	// The blur was half of it. With the blur off, the header is still 85% opaque cream over the
	// page, and that blend came out 1/255 apart on GitHub's machines over the same top 73 px
	// (43,000-47,000 pixels): the Monday rebuild of 9 Nov and uat-v4.22.0 (10 Nov) stopped on it,
	// while the PR runs of the same code passed. So the picture is taken with the header solid
	// cream; nothing see-through is left to blend.
	css:
		"*{backdrop-filter:none !important;-webkit-backdrop-filter:none !important}" +
		".nav,.nav--scrolled{background:#f4f3ee !important;transition:none !important}",
};
