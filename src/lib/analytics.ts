/**
 * Thin analytics wrapper so call sites don't repeat typeof-window + try/catch.
 * Dual-emits every custom event to BOTH:
 *   - Plausible (cookieless, consent-independent day-to-day traffic)
 *   - GA4 gtag (Google-ecosystem layer for Ads conversions / remarketing)
 *
 * Safe to call even when neither has loaded (offline, blocked, consent denied,
 * pre-mount): it silently no-ops. Both scripts auto-track pageviews, so this is
 * purely for custom events.
 *
 * Usage:
 *   import { track } from "../lib/analytics";
 *   track("Plan CTA Click", { plan: "clinic", source: "pricing" });
 */

export type AnalyticsProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, options?: { props?: AnalyticsProps }) => void;
type GtagFn = (command: string, ...args: unknown[]) => void;

declare global {
	interface Window {
		plausible?: PlausibleFn;
		gtag?: GtagFn;
	}
}

// GA4 event names must be snake_case (letters/digits/underscores). Plausible
// keeps the human-readable name; GA4 gets the normalised one.
const toGaName = (event: string): string =>
	event
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

export function track(event: string, props?: AnalyticsProps): void {
	if (typeof window === "undefined") return;
	try {
		window.plausible?.(event, props ? { props } : undefined);
	} catch {
		// Swallow — analytics must never break the page.
	}
	try {
		window.gtag?.("event", toGaName(event), props ?? {});
	} catch {
		// Swallow.
	}
}
