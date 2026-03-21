/**
 * Tests for lucoze-website main.js
 *
 * Each test creates a fresh JSDOM environment to avoid DOMContentLoaded
 * listener accumulation between tests. The IIFE in main.js registers its
 * handler once per loadMainJS call, so a shared document would accumulate
 * stale handlers across tests.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const REGION_JS = fs.readFileSync(path.resolve(__dirname, "../js/region.js"), "utf8");
const MAIN_JS = fs.readFileSync(path.resolve(__dirname, "../js/main.js"), "utf8");

/**
 * Create a fresh JSDOM environment with the given body HTML.
 * Returns { window, document } with matchMedia and IntersectionObserver polyfilled.
 */
function createEnv(bodyHTML = "", url = "http://localhost") {
	const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${bodyHTML}</body></html>`, {
		url: url,
		runScripts: "dangerously",
		pretendToBeVisual: true,
	});
	const { window } = dom;

	// Polyfill matchMedia (jsdom doesn't support it)
	window.matchMedia = jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	}));

	// Polyfill IntersectionObserver
	window.IntersectionObserver = class {
		constructor() {}
		observe() {}
		unobserve() {}
		disconnect() {}
	};

	return { dom, window, document: window.document };
}

/**
 * Load main.js into the given document and fire DOMContentLoaded.
 */
function initApp(doc) {
	// Load region.js first (provides LucozeRegion global)
	const regionScript = doc.createElement("script");
	regionScript.textContent = REGION_JS;
	doc.body.appendChild(regionScript);

	// Then load main.js
	const script = doc.createElement("script");
	script.textContent = MAIN_JS;
	doc.body.appendChild(script);

	const event = new doc.defaultView.Event("DOMContentLoaded", { bubbles: true });
	doc.dispatchEvent(event);
}

// ── detectRegion ──

describe("region-based pricing", () => {
	test("in region URL sets INR prices", () => {
		const { document: doc } = createEnv(
			`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="999"
				data-monthly-ae="49"
				data-monthly-intl="79">
			</div>
		`,
			"http://localhost/in/",
		);

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("999");
	});

	test("UAE region URL sets Middle East prices", () => {
		const { window, document: doc } = createEnv(
			`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="999"
				data-monthly-ae="49"
				data-monthly-intl="79">
			</div>
		`,
			"http://localhost/ae/",
		);

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("49");
	});

	test("default URL sets international prices", () => {
		const { window, document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="999"
				data-monthly-ae="49"
				data-monthly-intl="79">
			</div>
		`);

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("79");
	});

	test("fallback to international when Intl throws", () => {
		const { window, document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="999"
				data-monthly-intl="79"
				data-yearly-in="799"
				data-yearly-intl="67">
			</div>
		`);

		window.Intl.DateTimeFormat = function () {
			throw new Error("not supported");
		};

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("79");
	});
});

// ── Theme Toggle ──

describe("initTheme", () => {
	test("defaults to dark theme when no preference saved", () => {
		const { document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		initApp(doc);

		expect(doc.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(doc.querySelector(".icon-sun").style.display).toBe("none");
		expect(doc.querySelector(".icon-moon").style.display).toBe("block");
	});

	test("restores saved light theme from localStorage", () => {
		const { window, document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		window.localStorage.setItem("lucoze-theme", "light");
		initApp(doc);

		expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
		expect(doc.querySelector(".icon-sun").style.display).toBe("block");
		expect(doc.querySelector(".icon-moon").style.display).toBe("none");
	});

	test("clicking toggle switches theme from dark to light", () => {
		const { window, document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		initApp(doc);
		expect(doc.documentElement.getAttribute("data-theme")).toBe("dark");

		doc.getElementById("themeToggle").click();

		expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
		expect(window.localStorage.getItem("lucoze-theme")).toBe("light");
	});

	test("clicking toggle twice returns to dark theme", () => {
		const { window, document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		initApp(doc);

		doc.getElementById("themeToggle").click();
		doc.getElementById("themeToggle").click();

		expect(doc.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(window.localStorage.getItem("lucoze-theme")).toBe("dark");
	});
});

// ── Mobile Menu ──

describe("initMobileMenu", () => {
	test("toggle opens and closes mobile menu", () => {
		const { document: doc } = createEnv(`
			<button id="mobileMenuToggle" aria-expanded="false"></button>
			<nav id="mobileMenu">
				<a href="#features">Features</a>
				<a href="#pricing">Pricing</a>
			</nav>
		`);

		initApp(doc);

		const toggle = doc.getElementById("mobileMenuToggle");
		const menu = doc.getElementById("mobileMenu");

		// Open
		toggle.click();
		expect(menu.classList.contains("active")).toBe(true);
		expect(toggle.getAttribute("aria-expanded")).toBe("true");

		// Close
		toggle.click();
		expect(menu.classList.contains("active")).toBe(false);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
	});

	test("clicking a menu link closes the menu", () => {
		const { document: doc } = createEnv(`
			<button id="mobileMenuToggle" aria-expanded="false"></button>
			<nav id="mobileMenu">
				<a href="#features">Features</a>
			</nav>
		`);

		initApp(doc);

		const toggle = doc.getElementById("mobileMenuToggle");
		const menu = doc.getElementById("mobileMenu");

		toggle.click();
		expect(menu.classList.contains("active")).toBe(true);

		doc.querySelector("#mobileMenu a").click();
		expect(menu.classList.contains("active")).toBe(false);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
	});
});

// ── FAQ Accordion ──

describe("initFAQ", () => {
	test("clicking a question opens its FAQ item", () => {
		const { document: doc } = createEnv(`
			<div class="faq-list">
				<div class="faq-item">
					<div class="faq-item__question">Q1</div>
					<div class="faq-item__answer">A1</div>
				</div>
				<div class="faq-item">
					<div class="faq-item__question">Q2</div>
					<div class="faq-item__answer">A2</div>
				</div>
			</div>
		`);

		initApp(doc);

		const questions = doc.querySelectorAll(".faq-item__question");
		const items = doc.querySelectorAll(".faq-item");

		questions[0].click();
		expect(items[0].classList.contains("active")).toBe(true);
		expect(items[1].classList.contains("active")).toBe(false);
	});

	test("clicking a second question closes the first (accordion)", () => {
		const { document: doc } = createEnv(`
			<div class="faq-list">
				<div class="faq-item">
					<div class="faq-item__question">Q1</div>
					<div class="faq-item__answer">A1</div>
				</div>
				<div class="faq-item">
					<div class="faq-item__question">Q2</div>
					<div class="faq-item__answer">A2</div>
				</div>
			</div>
		`);

		initApp(doc);

		const questions = doc.querySelectorAll(".faq-item__question");
		const items = doc.querySelectorAll(".faq-item");

		questions[0].click();
		expect(items[0].classList.contains("active")).toBe(true);

		questions[1].click();
		expect(items[0].classList.contains("active")).toBe(false);
		expect(items[1].classList.contains("active")).toBe(true);
	});

	test("clicking an open question closes it", () => {
		const { document: doc } = createEnv(`
			<div class="faq-list">
				<div class="faq-item">
					<div class="faq-item__question">Q1</div>
					<div class="faq-item__answer">A1</div>
				</div>
			</div>
		`);

		initApp(doc);

		const question = doc.querySelector(".faq-item__question");
		const item = doc.querySelector(".faq-item");

		question.click();
		expect(item.classList.contains("active")).toBe(true);

		question.click();
		expect(item.classList.contains("active")).toBe(false);
	});
});

// ── Pricing Toggle ──

describe("initPricing", () => {
	test("billing toggle switches between monthly and yearly prices", () => {
		const { window, document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<span class="pricing__toggle-label">Monthly</span>
			<span class="pricing__toggle-label">Yearly</span>
			<div class="pricing-card__amount"
				data-monthly-intl="149"
				data-yearly-intl="127">
			</div>
			<div class="pricing-card__annual">Billed monthly</div>
		`);

		window.Intl.DateTimeFormat = function () {
			return { resolvedOptions: () => ({ timeZone: "America/New_York" }) };
		};

		initApp(doc);

		const amount = doc.querySelector(".pricing-card__amount");
		const annual = doc.querySelector(".pricing-card__annual");
		const labels = doc.querySelectorAll(".pricing__toggle-label");

		// Default: monthly
		expect(amount.textContent).toBe("149");
		expect(annual.textContent).toBe("Billed monthly");
		expect(labels[0].classList.contains("active")).toBe(true);
		expect(labels[1].classList.contains("active")).toBe(false);

		// Toggle to yearly
		doc.getElementById("billingToggle").click();
		expect(amount.textContent).toBe("127");
		expect(annual.textContent).toBe("Billed annually");
		expect(labels[0].classList.contains("active")).toBe(false);
		expect(labels[1].classList.contains("active")).toBe(true);

		// Toggle back to monthly
		doc.getElementById("billingToggle").click();
		expect(amount.textContent).toBe("149");
		expect(annual.textContent).toBe("Billed monthly");
	});

	test("category buttons switch between clinic and hospital plans", () => {
		const { document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<button class="pricing__category-btn active" id="clinicPlanBtn">Clinic Plans</button>
			<button class="pricing__category-btn" id="hospitalPlanBtn">Hospital Plans</button>
			<div id="pricing-clinic">Clinic plans</div>
			<div id="pricing-hospital" style="display:none">Hospital plans</div>
			<div class="pricing-card__amount" data-monthly-intl="149">149</div>
		`);

		initApp(doc);

		const clinicBtn = doc.getElementById("clinicPlanBtn");
		const hospitalBtn = doc.getElementById("hospitalPlanBtn");
		const clinicPanel = doc.getElementById("pricing-clinic");
		const hospitalPanel = doc.getElementById("pricing-hospital");

		// Click Hospital Plans
		hospitalBtn.click();
		expect(hospitalBtn.classList.contains("active")).toBe(true);
		expect(clinicBtn.classList.contains("active")).toBe(false);
		expect(hospitalPanel.style.display).toBe("");
		expect(clinicPanel.style.display).toBe("none");

		// Click Clinic Plans back
		clinicBtn.click();
		expect(clinicBtn.classList.contains("active")).toBe(true);
		expect(hospitalBtn.classList.contains("active")).toBe(false);
		expect(clinicPanel.style.display).toBe("");
		expect(hospitalPanel.style.display).toBe("none");
	});
});

// ── showAlert ──

describe("showAlert", () => {
	test("displays error alert via signup form validation", () => {
		const { document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="" />
				<input name="email" value="" />
				<button type="submit">Submit</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		initApp(doc);

		const form = doc.getElementById("signupForm");
		const event = new doc.defaultView.Event("submit", { bubbles: true, cancelable: true });
		form.dispatchEvent(event);

		const alert = doc.getElementById("signupAlert");
		expect(alert.classList.contains("alert--error")).toBe(true);
		expect(alert.classList.contains("show")).toBe(true);
		expect(alert.textContent).toBe("Please enter your facility name.");
	});
});

// ── Signup Form Validation ──

describe("initSignup form validation", () => {
	function submitForm(doc) {
		const form = doc.getElementById("signupForm");
		const event = new doc.defaultView.Event("submit", { bubbles: true, cancelable: true });
		form.dispatchEvent(event);
	}

	test("validates facility name is required", () => {
		const { document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="" />
				<input name="email" value="test@example.com" />
				<div class="plan-option selected" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<button type="submit">Submit</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("signupAlert").textContent).toBe("Please enter your facility name.");
	});

	test("validates email is required", () => {
		const { document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="Test Clinic" />
				<input name="email" value="" />
				<div class="plan-option selected" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<button type="submit">Submit</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("signupAlert").textContent).toBe("Please enter your email address.");
	});

	test("validates plan selection is required", () => {
		const { document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="Test Clinic" />
				<input name="email" value="test@example.com" />
				<div class="plan-option" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<button type="submit">Submit</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("signupAlert").textContent).toBe("Please select a plan.");
	});

	test("plan option click selects the plan", () => {
		const { document: doc } = createEnv(`
			<form id="signupForm">
				<div class="plan-option" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<div class="plan-option" data-plan="pro">
					<input type="radio" name="plan" value="pro" />
				</div>
			</form>
		`);

		initApp(doc);

		const options = doc.querySelectorAll(".plan-option");

		options[0].click();
		expect(options[0].classList.contains("selected")).toBe(true);
		expect(options[0].querySelector("input").checked).toBe(true);

		options[1].click();
		expect(options[0].classList.contains("selected")).toBe(false);
		expect(options[1].classList.contains("selected")).toBe(true);
		expect(options[1].querySelector("input").checked).toBe(true);
	});

	test("successful signup shows success message", () => {
		const { window, document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="Test Clinic" />
				<input name="email" value="test@example.com" />
				<input name="phone" value="" />
				<select name="country"><option value="India">India</option></select>
				<div class="plan-option selected" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<button type="submit">Start Your Free Trial</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		window.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ message: "ok" }),
			}),
		);

		initApp(doc);
		submitForm(doc);

		return new Promise((resolve) => {
			setTimeout(() => {
				const alert = doc.getElementById("signupAlert");
				expect(alert.classList.contains("alert--success")).toBe(true);
				expect(alert.textContent).toContain("workspace is being set up");
				resolve();
			}, 0);
		});
	});

	test("failed signup shows error message from server", () => {
		const { window, document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="Test Clinic" />
				<input name="email" value="test@example.com" />
				<input name="phone" value="" />
				<select name="country"><option value="India">India</option></select>
				<div class="plan-option selected" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<button type="submit">Start Your Free Trial</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		window.fetch = jest.fn(() =>
			Promise.resolve({
				ok: false,
				json: () => Promise.resolve({ message: "Email already registered" }),
			}),
		);

		initApp(doc);
		submitForm(doc);

		return new Promise((resolve) => {
			setTimeout(() => {
				const alert = doc.getElementById("signupAlert");
				expect(alert.classList.contains("alert--error")).toBe(true);
				expect(alert.textContent).toBe("Email already registered");
				resolve();
			}, 0);
		});
	});

	test("network error shows network error message", () => {
		const { window, document: doc } = createEnv(`
			<form id="signupForm">
				<input name="facility_name" value="Test Clinic" />
				<input name="email" value="test@example.com" />
				<input name="phone" value="" />
				<select name="country"><option value="India">India</option></select>
				<div class="plan-option selected" data-plan="starter">
					<input type="radio" name="plan" value="starter" />
				</div>
				<button type="submit">Start Your Free Trial</button>
			</form>
			<div id="signupAlert" class="alert"></div>
		`);

		window.fetch = jest.fn(() => Promise.reject(new Error("Network failure")));

		initApp(doc);
		submitForm(doc);

		return new Promise((resolve) => {
			setTimeout(() => {
				const alert = doc.getElementById("signupAlert");
				expect(alert.classList.contains("alert--error")).toBe(true);
				expect(alert.textContent).toContain("Network error");
				resolve();
			}, 0);
		});
	});
});

// ── Contact Form Validation ──

describe("initContact form validation", () => {
	function submitForm(doc) {
		const form = doc.getElementById("contactForm");
		const event = new doc.defaultView.Event("submit", { bubbles: true, cancelable: true });
		form.dispatchEvent(event);
	}

	test("validates name is required", () => {
		const { document: doc } = createEnv(`
			<form id="contactForm">
				<input name="name" value="" />
				<input name="email" value="test@example.com" />
				<select name="subject"><option value="General">General</option></select>
				<textarea name="message">Hello</textarea>
				<button type="submit">Send</button>
			</form>
			<div id="contactAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("contactAlert").textContent).toBe("Please enter your name.");
	});

	test("validates email is required", () => {
		const { document: doc } = createEnv(`
			<form id="contactForm">
				<input name="name" value="Test" />
				<input name="email" value="" />
				<select name="subject"><option value="General">General</option></select>
				<textarea name="message">Hello</textarea>
				<button type="submit">Send</button>
			</form>
			<div id="contactAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("contactAlert").textContent).toBe("Please enter your email address.");
	});

	test("validates subject is required", () => {
		const { document: doc } = createEnv(`
			<form id="contactForm">
				<input name="name" value="Test" />
				<input name="email" value="test@example.com" />
				<select name="subject"><option value="">-- Select --</option></select>
				<textarea name="message">Hello</textarea>
				<button type="submit">Send</button>
			</form>
			<div id="contactAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("contactAlert").textContent).toBe("Please select a subject.");
	});

	test("validates message is required", () => {
		const { document: doc } = createEnv(`
			<form id="contactForm">
				<input name="name" value="Test" />
				<input name="email" value="test@example.com" />
				<select name="subject"><option value="General">General</option></select>
				<textarea name="message"></textarea>
				<button type="submit">Send</button>
			</form>
			<div id="contactAlert" class="alert"></div>
		`);

		initApp(doc);
		submitForm(doc);

		expect(doc.getElementById("contactAlert").textContent).toBe("Please enter your message.");
	});

	test("successful contact form submission shows success", () => {
		const { window, document: doc } = createEnv(`
			<form id="contactForm">
				<input name="name" value="Test User" />
				<input name="email" value="test@example.com" />
				<input name="phone" value="1234567890" />
				<select name="subject"><option value="General">General</option></select>
				<textarea name="message">Hello world</textarea>
				<button type="submit">Send Message</button>
			</form>
			<div id="contactAlert" class="alert"></div>
		`);

		window.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ message: "ok" }),
			}),
		);

		initApp(doc);
		submitForm(doc);

		return new Promise((resolve) => {
			setTimeout(() => {
				const alert = doc.getElementById("contactAlert");
				expect(alert.classList.contains("alert--success")).toBe(true);
				expect(alert.textContent).toContain("received your message");
				resolve();
			}, 0);
		});
	});
});

// ── Navbar Scroll ──

describe("initNavScroll", () => {
	test("adds scrolled class when page is scrolled past 50px", () => {
		const { window, document: doc } = createEnv(`<nav class="nav"></nav>`);

		initApp(doc);

		const nav = doc.querySelector(".nav");

		// Initially not scrolled (scrollY defaults to 0)
		expect(nav.classList.contains("scrolled")).toBe(false);

		// Simulate scroll past 50px
		Object.defineProperty(window, "scrollY", { value: 100, writable: true, configurable: true });
		const scrollEvent = new window.Event("scroll", { bubbles: true });
		window.dispatchEvent(scrollEvent);
		expect(nav.classList.contains("scrolled")).toBe(true);

		// Scroll back up
		Object.defineProperty(window, "scrollY", { value: 10, writable: true, configurable: true });
		window.dispatchEvent(new window.Event("scroll", { bubbles: true }));
		expect(nav.classList.contains("scrolled")).toBe(false);
	});
});

// ── Country Select in Signup ──

describe("signup country select", () => {
	test("selecting India sets currency label to INR", () => {
		const { document: doc } = createEnv(`
			<form id="signupForm">
				<select name="country">
					<option value="India">India</option>
					<option value="United Arab Emirates">UAE</option>
					<option value="United States">US</option>
				</select>
				<span class="currency-label">USD</span>
			</form>
		`);

		initApp(doc);

		const countrySelect = doc.querySelector('[name="country"]');
		const currencyLabel = doc.querySelector(".currency-label");

		countrySelect.value = "India";
		const changeEvent = new doc.defaultView.Event("change", { bubbles: true });
		countrySelect.dispatchEvent(changeEvent);
		expect(currencyLabel.textContent).toBe("INR");

		countrySelect.value = "United States";
		countrySelect.dispatchEvent(new doc.defaultView.Event("change", { bubbles: true }));
		expect(currencyLabel.textContent).toBe("USD");
	});
});

// ── LucozeRegion module ──

describe("LucozeRegion", () => {
	function loadRegion(window) {
		const script = window.document.createElement("script");
		script.textContent = REGION_JS;
		window.document.body.appendChild(script);
		return window.LucozeRegion;
	}

	test("getRegionForCountry maps IN to ae slug", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getRegionForCountry("IN")).toBe("in");
	});

	test("getRegionForCountry maps AE to ae slug", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getRegionForCountry("AE")).toBe("ae");
	});

	test("getRegionForCountry maps SA to ae slug", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getRegionForCountry("SA")).toBe("ae");
	});

	test("getRegionForCountry maps SG to sg slug", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getRegionForCountry("SG")).toBe("sg");
	});

	test("getRegionForCountry returns null for unknown country", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getRegionForCountry("XX")).toBeNull();
	});

	test("getRegionInfo returns correct currency", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getRegionInfo("in").currency).toBe("inr");
		expect(region.getRegionInfo("in").symbol).toBe("\u20b9");
		expect(region.getRegionInfo("ae").currency).toBe("usd");
		expect(region.getRegionInfo("ae").symbol).toBe("$");
		expect(region.getRegionInfo("intl").currency).toBe("usd");
	});

	test("getFlag returns correct emoji for country code", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getFlag("AE")).toBe("\ud83c\udde6\ud83c\uddea");
		expect(region.getFlag("IN")).toBe("\ud83c\uddee\ud83c\uddf3");
		expect(region.getFlag("XX")).toBe("\ud83c\udf0d");
	});

	test("getCurrentRegionSlug reads from URL path", () => {
		const { window } = createEnv("", "http://localhost/ae/pricing");
		const region = loadRegion(window);
		expect(region.getCurrentRegionSlug()).toBe("ae");
	});

	test("getCurrentRegionSlug returns null for default path", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		expect(region.getCurrentRegionSlug()).toBeNull();
	});

	test("all GCC countries map to ae", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		["AE", "SA", "QA", "BH", "KW", "OM"].forEach((code) => {
			expect(region.getRegionForCountry(code)).toBe("ae");
		});
	});

	test("all ASEAN countries map to sg", () => {
		const { window } = createEnv();
		const region = loadRegion(window);
		["SG", "MY", "ID", "TH", "PH"].forEach((code) => {
			expect(region.getRegionForCountry(code)).toBe("sg");
		});
	});
});

// ── Country Selector ──

describe("country selector", () => {
	test("ae region URL shows AE pricing with $ currency", () => {
		const { document: doc } = createEnv(
			`
			<div id="billingToggle"></div>
			<div class="pricing-card__currency">$</div>
			<div class="pricing-card__amount"
				data-monthly-in="3,999"
				data-monthly-ae="99"
				data-monthly-intl="149">
			</div>
		`,
			"http://localhost/ae/",
		);

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("99");
		expect(doc.querySelector(".pricing-card__currency").textContent).toBe("$");
	});

	test("in region URL shows INR pricing with ₹ currency", () => {
		const { document: doc } = createEnv(
			`
			<div id="billingToggle"></div>
			<div class="pricing-card__currency">$</div>
			<div class="pricing-card__amount"
				data-monthly-in="3,999"
				data-monthly-ae="99"
				data-monthly-intl="149">
			</div>
		`,
			"http://localhost/in/",
		);

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("3,999");
		expect(doc.querySelector(".pricing-card__currency").textContent).toBe("₹");
	});
});

// ── Compliance Badges ──

describe("compliance badges", () => {
	test("badges render in HTML (server-side per region)", () => {
		// Compliance badges are now rendered by Astro at build time per region page.
		// This test verifies the badge HTML structure exists.
		const { document: doc } = createEnv(`
			<span class="compliance-badge">NABIDH Ready</span>
			<span class="compliance-badge">HL7 FHIR</span>
		`);

		const badges = doc.querySelectorAll(".compliance-badge");
		expect(badges.length).toBe(2);
		expect(badges[0].textContent).toBe("NABIDH Ready");
		expect(badges[1].textContent).toBe("HL7 FHIR");
	});
});

// ── SEA and Africa pricing ──

describe("region URL pricing tiers", () => {
	test("sg region URL shows SEA prices", () => {
		const { document: doc } = createEnv(
			`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="3,999"
				data-monthly-ae="99"
				data-monthly-sg="79"
				data-monthly-au="149"
				data-monthly-intl="149">
			</div>
		`,
			"http://localhost/sg/",
		);

		initApp(doc);
		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("79");
	});

	test("au region URL shows AU prices", () => {
		const { document: doc } = createEnv(
			`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="3,999"
				data-monthly-ae="99"
				data-monthly-sg="79"
				data-monthly-au="149"
				data-monthly-intl="149">
			</div>
		`,
			"http://localhost/au/",
		);

		initApp(doc);
		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("149");
	});

	test("unsupported region shows intl prices", () => {
		const { document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-in="3,999"
				data-monthly-ae="99"
				data-monthly-sg="79"
				data-monthly-intl="149">
			</div>
		`);

		initApp(doc);
		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("149");
	});
});
