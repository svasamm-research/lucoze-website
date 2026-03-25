import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://lucoze.com",
	output: "static",
	build: {
		assets: "_assets",
	},
});
