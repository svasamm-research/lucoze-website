/**
 * Visitor tracker stub. POSTs one event per page load to
 * `PUBLIC_TRACKING_ENDPOINT` so lucoze_admin can do server-side IP
 * enrichment (ipinfo.io) and auto-create Frappe CRM Leads for engaged
 * business visitors.
 *
 * Designed per `apps/lucoze_admin/docs/plans/2026-03-22-website-analytics-sales-intelligence.md`.
 *
 * Silent no-op when the env var isn't set (pre-launch state).
 * Uses navigator.sendBeacon when available so the request survives
 * page navigation; falls back to fetch with keepalive.
 *
 * Wire by setting at the website's BUILD env in Dokploy:
 *   PUBLIC_TRACKING_ENDPOINT=https://admin.lucoze.com/api/method/lucoze_admin.api.tracking.track_visit
 */

interface VisitorPayload {
	page: string;
	referrer: string | null;
	utm_source: string | null;
	utm_medium: string | null;
	utm_campaign: string | null;
	utm_content: string | null;
	utm_term: string | null;
	user_agent: string;
	viewport_w: number;
	viewport_h: number;
	ts: string;
}

export function initVisitorTracker(endpoint: string | undefined): void {
	if (!endpoint || typeof window === "undefined") return;

	const params = new URLSearchParams(window.location.search);
	const payload: VisitorPayload = {
		page: window.location.pathname,
		referrer: document.referrer || null,
		utm_source: params.get("utm_source"),
		utm_medium: params.get("utm_medium"),
		utm_campaign: params.get("utm_campaign"),
		utm_content: params.get("utm_content"),
		utm_term: params.get("utm_term"),
		user_agent: navigator.userAgent,
		viewport_w: window.innerWidth,
		viewport_h: window.innerHeight,
		ts: new Date().toISOString(),
	};

	const body = JSON.stringify(payload);

	try {
		if (typeof navigator.sendBeacon === "function") {
			const blob = new Blob([body], { type: "application/json" });
			if (navigator.sendBeacon(endpoint, blob)) return;
		}
		// sendBeacon unavailable or rejected — try fetch with keepalive.
		fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body,
			keepalive: true,
			mode: "cors",
		}).catch(() => {
			// Network errors must never affect the page.
		});
	} catch {
		// Belt-and-braces: never let analytics block a page render.
	}
}
