/** Generates branded 1200x630 OG images at build time (one per OG_PAGES entry),
 *  served at /open-graph/<route>.png. Crawler-only — never loaded by visitors,
 *  so zero impact on page speed. canvaskit is a build-only dependency. */
import { OGImageRoute } from "astro-og-canvas";
import { OG_PAGES } from "../../lib/og-pages";

export const { getStaticPaths, GET } = await OGImageRoute({
	pages: OG_PAGES,
	getImageOptions: (_path, page) => ({
		title: page.title,
		description: page.description,
		logo: { path: "./public/touch-icon-vault.png", size: [88] },
		bgGradient: [
			[247, 245, 240],
			[238, 233, 224],
		],
		border: { color: [193, 95, 60], width: 24, side: "inline-start" },
		padding: 72,
		font: {
			title: {
				color: [31, 29, 26],
				size: 60,
				lineHeight: 1.15,
				weight: "Bold",
				families: ["Manrope"],
			},
			description: {
				color: [92, 88, 82],
				size: 30,
				lineHeight: 1.4,
				weight: "Medium",
				families: ["Manrope"],
			},
		},
		fonts: ["./src/assets/fonts/manrope-700.ttf", "./src/assets/fonts/manrope-500.ttf"],
		format: "PNG",
	}),
});
