/**
 * Tests for pricing version check and regions.js pricing exports.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// ── regions.js exports ──

describe("regions.js pricing exports", () => {
	let regionsSource;

	beforeAll(() => {
		regionsSource = fs.readFileSync(path.resolve(__dirname, "../src/data/regions.js"), "utf8");
	});

	test("exports PRICING_VERSION as a positive integer", () => {
		expect(regionsSource).toMatch(/export\s+const\s+PRICING_VERSION\s*=\s*\d+/);
		// Extract the value
		const match = regionsSource.match(/export\s+const\s+PRICING_VERSION\s*=\s*(\d+)/);
		expect(match).not.toBeNull();
		expect(parseInt(match[1], 10)).toBeGreaterThan(0);
	});

	test("exports BILLING_API_URL with fallback to production", () => {
		expect(regionsSource).toMatch(/export\s+const\s+BILLING_API_URL/);
		expect(regionsSource).toContain("https://admin.lucoze.com");
	});

	test("uses Clinic Pro not Clinic Plus in plan names", () => {
		expect(regionsSource).not.toContain("Clinic Plus");
		expect(regionsSource).toContain("Clinic Pro");
	});

	test("all regions have Clinic Pro plan", () => {
		// Count occurrences of "Clinic Pro" — should be one per region (5 regions)
		const matches = regionsSource.match(/"Clinic Pro"/g);
		expect(matches).not.toBeNull();
		expect(matches.length).toBe(5);
	});
});

// ── pricing-check.js ──

describe("pricing-check.js", () => {
	let pricingCheckSource;

	beforeAll(() => {
		pricingCheckSource = fs.readFileSync(
			path.resolve(__dirname, "../public/js/pricing-check.js"),
			"utf8",
		);
	});

	test("file exists and is non-empty", () => {
		expect(pricingCheckSource.length).toBeGreaterThan(0);
	});

	test("is a self-executing IIFE", () => {
		expect(pricingCheckSource).toMatch(/^\s*\/\*\*[\s\S]*?\*\/\s*\(function/);
	});

	test("reads data-pricing-version from body", () => {
		expect(pricingCheckSource).toContain("data-pricing-version");
	});

	test("reads data-billing-api from body", () => {
		expect(pricingCheckSource).toContain("data-billing-api");
	});

	test("calls billing API pricing version endpoint", () => {
		expect(pricingCheckSource).toContain("billing.api.pricing.get_pricing_version");
	});

	test("calls billing API get_plans endpoint on version mismatch", () => {
		expect(pricingCheckSource).toContain("billing.api.pricing.get_plans");
	});

	test("gracefully handles API failure (catch block)", () => {
		// Should have catch blocks that silently fail
		expect(pricingCheckSource).toMatch(/\.catch\(function\s*\(\)/);
	});

	test("exits early when no API URL or version configured", () => {
		expect(pricingCheckSource).toContain("if (!apiUrl || !bakedVersion) return");
	});
});

// ── Runtime behavior ──

describe("pricing-check runtime", () => {
	function createPricingEnv(bodyAttrs, bodyHTML) {
		const attrStr = Object.entries(bodyAttrs)
			.map(([k, v]) => `${k}="${v}"`)
			.join(" ");
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body ${attrStr}>${bodyHTML}</body></html>`,
			{
				url: "http://localhost",
				runScripts: "dangerously",
				pretendToBeVisual: true,
			},
		);
		return dom;
	}

	test("does not fetch when no data-billing-api attribute", () => {
		const dom = createPricingEnv({ "data-pricing-version": "1" }, "");
		let fetchCalled = false;
		dom.window.fetch = jest.fn(() => {
			fetchCalled = true;
			return Promise.resolve({ json: () => Promise.resolve({}) });
		});

		const script = dom.window.document.createElement("script");
		script.textContent = fs.readFileSync(
			path.resolve(__dirname, "../public/js/pricing-check.js"),
			"utf8",
		);
		dom.window.document.body.appendChild(script);

		expect(fetchCalled).toBe(false);
	});

	test("does not fetch when no data-pricing-version attribute", () => {
		const dom = createPricingEnv({ "data-billing-api": "http://example.com" }, "");
		let fetchCalled = false;
		dom.window.fetch = jest.fn(() => {
			fetchCalled = true;
			return Promise.resolve({ json: () => Promise.resolve({}) });
		});

		const script = dom.window.document.createElement("script");
		script.textContent = fs.readFileSync(
			path.resolve(__dirname, "../public/js/pricing-check.js"),
			"utf8",
		);
		dom.window.document.body.appendChild(script);

		expect(fetchCalled).toBe(false);
	});

	test("fetches version check when both attributes present", () => {
		const dom = createPricingEnv(
			{
				"data-pricing-version": "1",
				"data-billing-api": "http://example.com",
			},
			"",
		);

		dom.window.fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve({ message: { version: 1 } }),
			}),
		);

		const script = dom.window.document.createElement("script");
		script.textContent = fs.readFileSync(
			path.resolve(__dirname, "../public/js/pricing-check.js"),
			"utf8",
		);
		dom.window.document.body.appendChild(script);

		expect(dom.window.fetch).toHaveBeenCalledTimes(1);
		expect(dom.window.fetch).toHaveBeenCalledWith(expect.stringContaining("get_pricing_version"));
	});

	test("fetches full plans when remote version is higher", () => {
		const dom = createPricingEnv(
			{
				"data-pricing-version": "1",
				"data-billing-api": "http://example.com",
			},
			"",
		);

		let callCount = 0;
		dom.window.fetch = jest.fn(() => {
			callCount++;
			if (callCount === 1) {
				// Version check — return higher version
				return Promise.resolve({
					json: () => Promise.resolve({ message: { version: 2 } }),
				});
			}
			// Plans fetch
			return Promise.resolve({
				json: () => Promise.resolve({ message: { plans: [] } }),
			});
		});

		const script = dom.window.document.createElement("script");
		script.textContent = fs.readFileSync(
			path.resolve(__dirname, "../public/js/pricing-check.js"),
			"utf8",
		);
		dom.window.document.body.appendChild(script);

		return new Promise((resolve) => {
			setTimeout(() => {
				expect(dom.window.fetch).toHaveBeenCalledTimes(2);
				expect(dom.window.fetch).toHaveBeenLastCalledWith(expect.stringContaining("get_plans"));
				resolve();
			}, 50);
		});
	});

	test("does not fetch plans when version matches", () => {
		const dom = createPricingEnv(
			{
				"data-pricing-version": "1",
				"data-billing-api": "http://example.com",
			},
			"",
		);

		dom.window.fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve({ message: { version: 1 } }),
			}),
		);

		const script = dom.window.document.createElement("script");
		script.textContent = fs.readFileSync(
			path.resolve(__dirname, "../public/js/pricing-check.js"),
			"utf8",
		);
		dom.window.document.body.appendChild(script);

		return new Promise((resolve) => {
			setTimeout(() => {
				// Only the version check call, no plans fetch
				expect(dom.window.fetch).toHaveBeenCalledTimes(1);
				resolve();
			}, 50);
		});
	});
});
