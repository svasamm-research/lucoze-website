import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
	site: "https://lucoze.com",
	output: "static",
	integrations: [
		react(),
		mdx(),
		sitemap({
			// Exclude internal preview from the sitemap. Canonical solutions
			// URLs are /in/solutions/clinics/ and /in/solutions/hospitals/;
			// the legacy hyphenated paths now only exist as 301 redirects.
			filter: (page) => !page.includes("/in/redesign-preview/"),
		}),
	],
	// Legacy regions /ae /au /sg and root paths now redirect to /in/. India is
	// the only served region for v1.0.0 launch; specific redirects preserve
	// existing inbound links, with a catch-all for anything else under those
	// region prefixes.
	redirects: {
		// Root paths
		"/": "/in/",
		"/pricing": "/in/pricing/",
		"/signup": "/in/signup/",
		"/about": "/in/about/",
		"/contact": "/in/contact/",
		"/privacy": "/in/privacy/",
		"/terms": "/in/terms/",
		"/solutions-clinics": "/in/solutions/clinics/",
		"/solutions-hospitals": "/in/solutions/hospitals/",
		// Legacy hyphenated /in/* URLs (previous BaseLayout pages, now deleted).
		"/in/solutions-clinics": "/in/solutions/clinics/",
		"/in/solutions-hospitals": "/in/solutions/hospitals/",
		// /ae — UAE region (legacy)
		"/ae": "/in/",
		"/ae/": "/in/",
		"/ae/signup": "/in/signup/",
		"/ae/about": "/in/about/",
		"/ae/contact": "/in/contact/",
		"/ae/privacy": "/in/privacy/",
		"/ae/terms": "/in/terms/",
		"/ae/solutions-clinics": "/in/solutions/clinics/",
		"/ae/solutions-hospitals": "/in/solutions/hospitals/",
		// /au — Australia region (legacy)
		"/au": "/in/",
		"/au/": "/in/",
		"/au/signup": "/in/signup/",
		"/au/about": "/in/about/",
		"/au/contact": "/in/contact/",
		"/au/privacy": "/in/privacy/",
		"/au/terms": "/in/terms/",
		"/au/solutions-clinics": "/in/solutions/clinics/",
		"/au/solutions-hospitals": "/in/solutions/hospitals/",
		// /sg — Singapore region (legacy)
		"/sg": "/in/",
		"/sg/": "/in/",
		"/sg/signup": "/in/signup/",
		"/sg/about": "/in/about/",
		"/sg/contact": "/in/contact/",
		"/sg/privacy": "/in/privacy/",
		"/sg/terms": "/in/terms/",
		"/sg/solutions-clinics": "/in/solutions/clinics/",
		"/sg/solutions-hospitals": "/in/solutions/hospitals/",
	},
	build: {
		assets: "_assets",
	},
});
