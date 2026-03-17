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

const MAIN_JS = fs.readFileSync(path.resolve(__dirname, "../js/main.js"), "utf8");

/**
 * Create a fresh JSDOM environment with the given body HTML.
 * Returns { window, document } with matchMedia and IntersectionObserver polyfilled.
 */
function createEnv(bodyHTML = "") {
	const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${bodyHTML}</body></html>`, {
		url: "http://localhost",
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
	const script = doc.createElement("script");
	script.textContent = MAIN_JS;
	doc.body.appendChild(script);

	const event = new doc.defaultView.Event("DOMContentLoaded", { bubbles: true });
	doc.dispatchEvent(event);
}

// ── detectRegion ──

describe("detectRegion (via pricing behavior)", () => {
	test("Indian timezone sets INR prices", () => {
		const { window, document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-inr="999"
				data-monthly-usd="29"
				data-yearly-inr="799"
				data-yearly-usd="24">
			</div>
		`);

		// Mock timezone to Asia/Kolkata
		const Original = window.Intl.DateTimeFormat;
		window.Intl.DateTimeFormat = function () {
			return { resolvedOptions: () => ({ timeZone: "Asia/Kolkata" }) };
		};

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("999");
		window.Intl.DateTimeFormat = Original;
	});

	test("non-Indian timezone sets USD prices", () => {
		const { window, document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-inr="999"
				data-monthly-usd="29"
				data-yearly-inr="799"
				data-yearly-usd="24">
			</div>
		`);

		window.Intl.DateTimeFormat = function () {
			return { resolvedOptions: () => ({ timeZone: "America/New_York" }) };
		};

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("29");
	});

	test("fallback to USD when Intl throws", () => {
		const { window, document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<div class="pricing-card__amount"
				data-monthly-inr="999"
				data-monthly-usd="29"
				data-yearly-inr="799"
				data-yearly-usd="24">
			</div>
		`);

		window.Intl.DateTimeFormat = function () {
			throw new Error("not supported");
		};

		initApp(doc);

		expect(doc.querySelector(".pricing-card__amount").textContent).toBe("29");
	});
});

// ── Theme Toggle ──

describe("initTheme", () => {
	test("defaults to light theme when no preference saved", () => {
		const { document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		initApp(doc);

		expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
		expect(doc.querySelector(".icon-sun").style.display).toBe("block");
		expect(doc.querySelector(".icon-moon").style.display).toBe("none");
	});

	test("restores saved dark theme from localStorage", () => {
		const { window, document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		window.localStorage.setItem("lucoze-theme", "dark");
		initApp(doc);

		expect(doc.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(doc.querySelector(".icon-sun").style.display).toBe("none");
		expect(doc.querySelector(".icon-moon").style.display).toBe("block");
	});

	test("clicking toggle switches theme from light to dark", () => {
		const { window, document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		initApp(doc);
		expect(doc.documentElement.getAttribute("data-theme")).toBe("light");

		doc.getElementById("themeToggle").click();

		expect(doc.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(window.localStorage.getItem("lucoze-theme")).toBe("dark");
	});

	test("clicking toggle twice returns to original theme", () => {
		const { window, document: doc } = createEnv(`
			<button id="themeToggle"></button>
			<span class="icon-sun"></span>
			<span class="icon-moon"></span>
		`);

		initApp(doc);

		doc.getElementById("themeToggle").click();
		doc.getElementById("themeToggle").click();

		expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
		expect(window.localStorage.getItem("lucoze-theme")).toBe("light");
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
				data-monthly-usd="29"
				data-yearly-usd="24">
			</div>
			<div class="pricing-card__annual"
				data-annual-usd="$288">
			</div>
		`);

		// Force USD
		window.Intl.DateTimeFormat = function () {
			return { resolvedOptions: () => ({ timeZone: "America/New_York" }) };
		};

		initApp(doc);

		const amount = doc.querySelector(".pricing-card__amount");
		const annual = doc.querySelector(".pricing-card__annual");
		const labels = doc.querySelectorAll(".pricing__toggle-label");

		// Default: monthly
		expect(amount.textContent).toBe("29");
		expect(annual.textContent).toBe("Billed monthly");
		expect(labels[0].classList.contains("active")).toBe(true);
		expect(labels[1].classList.contains("active")).toBe(false);

		// Toggle to yearly
		doc.getElementById("billingToggle").click();
		expect(amount.textContent).toBe("24");
		expect(annual.textContent).toBe("Billed $288 per year");
		expect(labels[0].classList.contains("active")).toBe(false);
		expect(labels[1].classList.contains("active")).toBe(true);

		// Toggle back to monthly
		doc.getElementById("billingToggle").click();
		expect(amount.textContent).toBe("29");
		expect(annual.textContent).toBe("Billed monthly");
	});

	test("category tabs switch pricing panels", () => {
		const { document: doc } = createEnv(`
			<div id="billingToggle"></div>
			<button class="pricing__tab active" data-category="clinics">Clinics</button>
			<button class="pricing__tab" data-category="hospitals">Hospitals</button>
			<div id="pricing-clinics">Clinic plans</div>
			<div id="pricing-hospitals" style="display:none">Hospital plans</div>
		`);

		initApp(doc);

		const tabs = doc.querySelectorAll(".pricing__tab");
		const clinicsPanel = doc.getElementById("pricing-clinics");
		const hospitalsPanel = doc.getElementById("pricing-hospitals");

		tabs[1].click();
		expect(tabs[0].classList.contains("active")).toBe(false);
		expect(tabs[1].classList.contains("active")).toBe(true);
		expect(clinicsPanel.style.display).toBe("none");
		expect(hospitalsPanel.style.display).toBe("");
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
					<option value="USA">USA</option>
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

		countrySelect.value = "USA";
		countrySelect.dispatchEvent(new doc.defaultView.Event("change", { bubbles: true }));
		expect(currencyLabel.textContent).toBe("USD");
	});
});
