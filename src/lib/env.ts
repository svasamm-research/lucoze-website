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
