/**
 * Tests for src/lib/subscribe.ts.
 *
 * Deviates from a plain `import.meta.env` mock: this repo's jest runs
 * CommonJS (no ESM/`--experimental-vm-modules`), and `import.meta` is
 * invalid syntax outside a real ES module — it can't be parsed by the
 * Babel-to-CJS transform at all, mocked or not. `src/lib/env.ts` isolates
 * the one `import.meta.env` read; jest.mock() swaps the whole module out
 * before Jest ever has to parse it. Same three required behaviors as the
 * spec: invalid email -> no fetch, valid email -> POST + track(), fetch
 * rejection -> network reason.
 */

const mockTrack = jest.fn();
jest.mock("../src/lib/analytics.ts", () => ({ track: mockTrack }));

const mockGetPublicEnv = jest.fn();
jest.mock("../src/lib/env.ts", () => ({ getPublicEnv: mockGetPublicEnv }));

const { subscribe, isValidEmail } = require("../src/lib/subscribe.ts");

beforeEach(() => {
	mockTrack.mockClear();
	globalThis.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
	mockGetPublicEnv.mockReturnValue({
		marketingUrl: "https://marketing.lucoze.com",
		newsletterListUuid: "uuid-1",
	});
});

test("isValidEmail rejects obviously bad input", () => {
	expect(isValidEmail("nope")).toBe(false);
	expect(isValidEmail("a@b.com")).toBe(true);
});

test("rejects an invalid email without calling fetch", async () => {
	const r = await subscribe("nope", "footer");
	expect(r).toEqual({ ok: false, reason: "invalid" });
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("drops honeypot-tripped submissions as bot without calling fetch", async () => {
	const r = await subscribe("a@b.com", "footer", "trap-filled");
	expect(r).toEqual({ ok: false, reason: "bot" });
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("POSTs JSON to the Listmonk public API and tracks on success", async () => {
	const r = await subscribe("a@b.com", "footer");
	expect(r.ok).toBe(true);
	const [url, opts] = globalThis.fetch.mock.calls[0];
	expect(url).toBe("https://marketing.lucoze.com/api/public/subscription");
	expect(JSON.parse(opts.body)).toEqual({ email: "a@b.com", list_uuids: ["uuid-1"] });
	expect(mockTrack).toHaveBeenCalledWith("Newsletter Subscribed", { placement: "footer" });
});

test("returns network reason when fetch rejects", async () => {
	globalThis.fetch = jest.fn(() => Promise.reject(new Error("down")));
	const r = await subscribe("a@b.com", "footer");
	expect(r).toEqual({ ok: false, reason: "network" });
});

test("returns network reason when fetch responds not-ok", async () => {
	globalThis.fetch = jest.fn(() => Promise.resolve({ ok: false }));
	const r = await subscribe("a@b.com", "footer");
	expect(r).toEqual({ ok: false, reason: "network" });
});

test("returns network reason when marketing URL or list UUID isn't configured", async () => {
	mockGetPublicEnv.mockReturnValue({ marketingUrl: undefined, newsletterListUuid: undefined });
	const r = await subscribe("a@b.com", "footer");
	expect(r).toEqual({ ok: false, reason: "network" });
	expect(globalThis.fetch).not.toHaveBeenCalled();
});
