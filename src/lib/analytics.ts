/**
 * Thin wrapper around Plausible's `window.plausible(...)` so call sites
 * don't have to repeat the typeof-window + try/catch boilerplate.
 *
 * Safe to call even when Plausible hasn't loaded (offline, blocked, or
 * pre-mount): it silently no-ops. Plausible's script auto-tracks
 * pageviews, so this is purely for custom events.
 *
 * Usage:
 *   import { track } from "../lib/analytics";
 *   track("Plan CTA Click", { plan: "clinic", source: "pricing" });
 */

export type AnalyticsProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, options?: { props?: AnalyticsProps }) => void;

declare global {
	interface Window {
		plausible?: PlausibleFn;
	}
}

export function track(event: string, props?: AnalyticsProps): void {
	if (typeof window === "undefined") return;
	try {
		window.plausible?.(event, props ? { props } : undefined);
	} catch {
		// Swallow — analytics must never break the page.
	}
}
