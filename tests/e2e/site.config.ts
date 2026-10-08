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
};
