import { track } from "./analytics";
import { getPublicEnv } from "./env";

export const isValidEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

type Result = { ok: boolean; reason?: "invalid" | "network" | "bot" };

/** POST an email to Listmonk's public subscription API (double opt-in). */
export async function subscribe(email: string, placement: string, honeypot = ""): Promise<Result> {
	if (honeypot) return { ok: false, reason: "bot" }; // silently drop bots
	const clean = email.trim();
	if (!isValidEmail(clean)) return { ok: false, reason: "invalid" };
	const { marketingUrl: base, newsletterListUuid: list } = getPublicEnv();
	if (!base || !list) return { ok: false, reason: "network" }; // not configured
	try {
		const res = await fetch(`${base}/api/public/subscription`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: clean, list_uuids: [list] }),
		});
		if (!res.ok) return { ok: false, reason: "network" };
		track("Newsletter Subscribed", { placement });
		return { ok: true };
	} catch {
		return { ok: false, reason: "network" };
	}
}
