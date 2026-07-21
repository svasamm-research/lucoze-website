import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

/**
 * Unwrap spurious block <p> that MDX injects inside inline/tight containers.
 *
 * Blog posts author paragraphs and list items as HTML (`<p>…</p>`, `<li>…</li>`)
 * containing `{" "}` spacers and inline `<a>` links. When a link's text or an
 * item's description sits on its own source line (Prettier wraps long
 * external-link tags — the ones with target/rel — that way), MDX markdown-parses
 * that text run and wraps it in its own <p>. So an authored <p> ends up holding
 * block <p> children, an <a> becomes a block link, and a Sources <li> renders
 * its link and description on two separate lines with a gap.
 *
 * Rather than rewrite every post (and fight Prettier re-wrapping), we flatten
 * the malformed tree at build: any <p> nested inside a <p>, <a>, or <li> —
 * contexts where a block paragraph is either invalid or breaks intended inline
 * flow — is replaced by its own children. <blockquote> is deliberately excluded
 * (a <p> there is legitimate). Runs across the whole blog, present and future.
 */
function rehypeUnwrapNestedParagraphs() {
	// Tag name whether the node is a real hast element (tagName) or an authored
	// MDX element that stays a JSX node through rehype (name). Authored <p>/<a>/
	// <li> are the JSX form; MDX's auto-wrapped inner <p>s are hast elements.
	const tagOf = (n) =>
		n.type === "element"
			? n.tagName
			: n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement"
				? n.name
				: null;
	// Containers inside which a block <p> should be unwrapped back to inline.
	const UNWRAP_INSIDE = new Set(["p", "a", "li"]);
	// Containers where a <p> is legitimate — reset the context so we don't touch
	// them (e.g. a founder pull-quote that happens to sit inside a list).
	const RESET_INSIDE = new Set(["blockquote"]);
	const walk = (node, unwrapHere) => {
		if (!node.children) return;
		const out = [];
		for (const child of node.children) {
			const tag = tagOf(child);
			if (tag === "p" && unwrapHere) {
				walk(child, true); // flatten any deeper nesting first
				out.push(...child.children); // hoist inline content up
			} else {
				const next = RESET_INSIDE.has(tag) ? false : unwrapHere || UNWRAP_INSIDE.has(tag);
				walk(child, next);
				out.push(child);
			}
		}
		node.children = out;
	};
	return (tree) => walk(tree, false);
}

export default defineConfig({
	site: "https://lucoze.com",
	output: "static",
	integrations: [
		react(),
		mdx({ rehypePlugins: [rehypeUnwrapNestedParagraphs] }),
		sitemap({
			// Exclude internal preview from the sitemap. Canonical solutions
			// URLs are /in/solutions/clinics/ and /in/solutions/hospitals/;
			// the legacy hyphenated paths now only exist as 301 redirects.
			filter: (page) => !page.includes("/in/redesign-preview/"),
			// lastmod = build/publish time (whole static site ships together on
			// each deploy). priority nudges the homepage above deep pages.
			// ponytail: uniform lastmod is a weak signal — swap to per-page git
			// mtime if crawl budget ever becomes a real constraint.
			lastmod: new Date(),
			serialize(item) {
				if (item.url === "https://lucoze.com/in/") item.priority = 1.0;
				else if (/\/in\/(pricing|signup)\/$/.test(item.url)) item.priority = 0.9;
				else if (/\/in\/(features|solutions|specialties)\//.test(item.url)) item.priority = 0.8;
				else if (item.url.includes("/in/blog/")) item.changefreq = "weekly";
				return item;
			},
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
		// Legacy hyphenated /in/solutions-* URLs are handled as real 301s in
		// nginx.conf (Astro's redirect emits a meta-refresh + noindex stub, which
		// robots.txt then blocked Googlebot from crawling). Not defined here.
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
