import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
	site: "https://lucoze.com",
	output: "static",
	integrations: [react(), mdx(), sitemap()],
	build: {
		assets: "_assets",
	},
});
