// claude-design hero pipeline: HTML/SVG source -> crisp PNG.
// Usage: node scripts/hero-render/render.mjs <source.html> <out.png>
// Renders the #stage element (1200x600) at 2x device scale for retina sharpness.
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const [src, out] = process.argv.slice(2);
if (!src || !out) {
	console.error("usage: render.mjs <source.html> <out.png>");
	process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setViewportSize({ width: 1200, height: 600 });
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: "networkidle" });
const stage = await page.$("#stage");
await stage.screenshot({ path: resolve(out) });
await browser.close();
console.log("wrote", out);
