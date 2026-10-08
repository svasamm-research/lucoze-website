// What differs per site. site.spec.ts and visual.spec.ts are the SAME files in
// svasamm-site, t4suite-site and lucoze-website — change them in all three.
// (Lucoze serves with `astro preview`, so it needs no static-server.mjs.)
export const SITE = {
	origin: "https://lucoze.com",
	built: "dist",
	sitemaps: ["dist/sitemap-0.xml"],
	keyPages: ["/in/", "/in/solutions/hospitals/", "/in/pricing/", "/in/features/", "/in/contact/"],
	forms: [] as { path: string; form: string; fields: string[] }[], // the lead form is covered in smoke.spec.ts
	// Native <select>s can render a pixel up or down between identical runs (svasamm-site,
	// 8 Oct 2026, 401 px on its contact form); masked so the 100-px allowance stays honest.
	mask: ["select"] as string[],
};
