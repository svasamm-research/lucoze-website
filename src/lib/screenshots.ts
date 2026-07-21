import type { ImageMetadata } from "astro";

/**
 * All product screenshots, resolved by file name (without extension). Covers are
 * PNG; gallery shots added for the flow tour are pre-resized WebP. Shared by
 * <Screenshot> and <ProductTour> so the glob lives in exactly one place.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>("../assets/screenshots/*.{png,webp}", {
	eager: true,
});

export const screenshotByName: Record<string, ImageMetadata> = {};
for (const path in modules) {
	const key = path
		.split("/")
		.pop()!
		.replace(/\.(png|webp)$/, "");
	screenshotByName[key] = modules[path].default;
}
