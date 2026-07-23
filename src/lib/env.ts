/**
 * Isolates `import.meta.env` access so callers (and their tests) don't touch
 * Vite's build-time syntax directly. Astro/Vite statically inlines
 * `import.meta.env.PUBLIC_*` at build time — this file is the only place
 * that reads it, so a test can `jest.mock("./env", ...)` the whole module
 * instead of needing Jest to parse ESM `import.meta` syntax.
 */
export function getPublicEnv() {
	return {
		marketingUrl: import.meta.env.PUBLIC_MARKETING_URL as string | undefined,
		newsletterListUuid: import.meta.env.PUBLIC_NEWSLETTER_LIST_UUID as string | undefined,
	};
}

// Single source of truth for whether the newsletter feature renders at all.
// Gates on BOTH vars — URL-set-but-UUID-empty would still render a form
// whose every submit fails. SubscribeForm and its three call sites (Footer,
// blog index, blog post CTA) must all import this instead of re-deriving it,
// so gated-off builds never leave orphaned wrapper chrome around a form that
// didn't render.
export const newsletterEnabled = !!(
	import.meta.env.PUBLIC_MARKETING_URL && import.meta.env.PUBLIC_NEWSLETTER_LIST_UUID
);
