"use strict";

(function () {
	// ── Region Detection (uses LucozeRegion from region.js) ──

	function getRegion() {
		if (typeof LucozeRegion === "undefined") {
			return { region: "intl", currency: "usd" };
		}
		var country = LucozeRegion.detectCountry();
		var regionCode = LucozeRegion.getRegionForCountry(country);
		var info = LucozeRegion.getRegionInfo(regionCode);
		return { region: regionCode, currency: info.currency, country: country };
	}

	// ── Theme Toggle ──

	function initTheme() {
		var saved = localStorage.getItem("lucoze-theme");
		var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		var theme = saved || (prefersDark ? "dark" : "light");
		applyTheme(theme);

		var toggle = document.getElementById("themeToggle");
		if (toggle) {
			toggle.addEventListener("click", function () {
				var current = document.documentElement.getAttribute("data-theme");
				applyTheme(current === "dark" ? "light" : "dark");
			});
		}
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("lucoze-theme", theme);
		document.querySelectorAll(".icon-sun").forEach(function (el) {
			el.style.display = theme === "dark" ? "none" : "block";
		});
		document.querySelectorAll(".icon-moon").forEach(function (el) {
			el.style.display = theme === "dark" ? "block" : "none";
		});
	}

	// ── Navbar Scroll ──

	function initNavScroll() {
		var nav = document.querySelector(".nav");
		if (!nav) return;

		function onScroll() {
			if (window.scrollY > 50) {
				nav.classList.add("scrolled");
			} else {
				nav.classList.remove("scrolled");
			}
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}

	// ── Mobile Menu ──

	function initMobileMenu() {
		var toggle = document.getElementById("mobileMenuToggle");
		var menu = document.getElementById("mobileMenu");
		if (!toggle || !menu) return;

		toggle.addEventListener("click", function () {
			var isOpen = menu.classList.toggle("active");
			toggle.setAttribute("aria-expanded", String(isOpen));
		});

		menu.querySelectorAll("a").forEach(function (link) {
			link.addEventListener("click", function () {
				menu.classList.remove("active");
				toggle.setAttribute("aria-expanded", "false");
			});
		});
	}

	// ── Scroll Animations ──

	function initScrollAnimations() {
		var targets = document.querySelectorAll(".fade-in");
		if (!targets.length) return;

		if (!("IntersectionObserver" in window)) {
			targets.forEach(function (el) {
				el.classList.add("visible");
			});
			return;
		}

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
		);

		targets.forEach(function (el) {
			observer.observe(el);
		});
	}

	// ── FAQ Accordion ──

	function initFAQ() {
		var questions = document.querySelectorAll(".faq-item__question");
		if (!questions.length) return;

		questions.forEach(function (question) {
			question.addEventListener("click", function () {
				var item = question.closest(".faq-item");
				if (!item) return;

				var wasActive = item.classList.contains("active");
				item.parentElement.querySelectorAll(".faq-item.active").forEach(function (open) {
					open.classList.remove("active");
				});

				if (!wasActive) {
					item.classList.add("active");
				}
			});
		});
	}

	// ── Smooth Scroll ──

	function initSmoothScroll() {
		document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
			anchor.addEventListener("click", function (e) {
				var hash = anchor.getAttribute("href");
				if (!hash || hash === "#") return;

				var target = document.querySelector(hash);
				if (!target) return;

				e.preventDefault();
				target.scrollIntoView({ behavior: "smooth", block: "start" });

				if (history.pushState) {
					history.pushState(null, "", hash);
				}
			});
		});
	}

	// ── Country Selector (Flag Icon + Modal) ──

	function initCountrySelector() {
		var btn = document.getElementById("countryBtn");
		var modal = document.getElementById("countryModal");
		if (!btn || !modal) return;

		// Detect country and set flag
		if (typeof LucozeRegion !== "undefined") {
			LucozeRegion.detectCountry(function (countryCode) {
				var flag = LucozeRegion.getFlag(countryCode);
				var flagEl = document.getElementById("countryFlag");
				if (flagEl) flagEl.textContent = flag;

				// Auto-redirect if not already on the correct region page
				var currentRegion = LucozeRegion.getCurrentRegionSlug();
				var detectedRegion = LucozeRegion.getRegionForCountry(countryCode);
				var hasVisited = localStorage.getItem(LucozeRegion.STORAGE_KEY);

				// Only auto-redirect on first visit (no stored preference)
				if (!hasVisited && detectedRegion && detectedRegion !== currentRegion) {
					LucozeRegion.navigateToRegion(detectedRegion);
				}
			});
		}

		// Open modal on click
		btn.addEventListener("click", function () {
			modal.style.display = "";
		});

		// Close modal on backdrop or close button click
		modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
			el.addEventListener("click", function () {
				modal.style.display = "none";
			});
		});

		// Navigate on country selection
		modal.querySelectorAll(".country-modal__country").forEach(function (el) {
			el.addEventListener("click", function () {
				var regionSlug = el.getAttribute("data-region");
				if (typeof LucozeRegion !== "undefined") {
					LucozeRegion.navigateToRegion(regionSlug);
				}
			});
		});

		// Close on Escape key
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && modal.style.display !== "none") {
				modal.style.display = "none";
			}
		});
	}

	// ── Pricing Interactions ──

	function initPricing() {
		var detected = getRegion();
		var pricingKey = detected.region; // in, me, sea, af, intl
		var isYearly = false;

		var billingToggle = document.getElementById("billingToggle");
		var categoryTabs = document.querySelectorAll(".pricing__tab");
		var pricingPanels = document.querySelectorAll('[id^="pricing-"]');

		if (!billingToggle && !categoryTabs.length) return;

		// Check if toggle is already in yearly state
		if (billingToggle && billingToggle.classList.contains("active")) {
			isYearly = true;
		}

		function updatePrices() {
			var period = isYearly ? "yearly" : "monthly";

			document.querySelectorAll(".pricing-card__amount").forEach(function (el) {
				// Try region-specific price first, fallback to currency-based
				var price = el.getAttribute("data-" + period + "-" + pricingKey);
				if (!price) {
					// Fallback for pages that still use old format
					var fallbackCurrency = pricingKey === "in" ? "inr" : "usd";
					price = el.getAttribute("data-" + period + "-" + fallbackCurrency);
				}
				if (price) {
					el.textContent = price;
				}
			});

			// Update currency symbols
			var info =
				typeof LucozeRegion !== "undefined"
					? LucozeRegion.getRegionInfo(pricingKey)
					: { symbol: "$" };
			document.querySelectorAll(".pricing-card__currency").forEach(function (el) {
				el.textContent = info.symbol;
			});

			document.querySelectorAll(".pricing-card__annual").forEach(function (el) {
				el.textContent = isYearly ? "Billed annually" : "Billed monthly";
			});

			// Update toggle label active states
			document.querySelectorAll(".pricing__toggle-label").forEach(function (label) {
				label.classList.remove("active");
			});
			var labels = document.querySelectorAll(".pricing__toggle-label");
			if (labels.length >= 2) {
				labels[isYearly ? 1 : 0].classList.add("active");
			}
		}

		// Billing toggle
		if (billingToggle) {
			// Remove old listeners by cloning
			var newToggle = billingToggle.cloneNode(true);
			billingToggle.parentNode.replaceChild(newToggle, billingToggle);
			billingToggle = newToggle;

			billingToggle.addEventListener("click", function () {
				isYearly = billingToggle.classList.toggle("active");
				updatePrices();
			});
		}

		// Category tabs
		categoryTabs.forEach(function (tab) {
			tab.addEventListener("click", function () {
				categoryTabs.forEach(function (t) {
					t.classList.remove("active");
				});
				tab.classList.add("active");

				var category = tab.getAttribute("data-category");
				pricingPanels.forEach(function (panel) {
					panel.style.display = panel.id === "pricing-" + category ? "" : "none";
				});
			});
		});

		// Set initial prices
		updatePrices();
	}

	// ── Signup Page Logic ──

	function initSignup() {
		var form = document.getElementById("signupForm");
		if (!form) return;

		var detected = getRegion();

		// Plan category tabs within the signup form
		var planTabs = form.querySelectorAll(".pricing__tab[data-category]");
		planTabs.forEach(function (tab) {
			tab.addEventListener("click", function () {
				planTabs.forEach(function (t) {
					t.classList.remove("active");
				});
				tab.classList.add("active");

				var category = tab.getAttribute("data-category");
				form.querySelectorAll(".plan-option[data-category]").forEach(function (option) {
					option.style.display = option.getAttribute("data-category") === category ? "" : "none";
				});
				form.querySelectorAll(".plan-option.selected").forEach(function (o) {
					if (o.getAttribute("data-category") !== category) {
						o.classList.remove("selected");
					}
				});
			});
		});

		// Plan option selection
		form.querySelectorAll(".plan-option").forEach(function (option) {
			option.addEventListener("click", function () {
				form.querySelectorAll(".plan-option").forEach(function (o) {
					o.classList.remove("selected");
				});
				option.classList.add("selected");
				var radio = option.querySelector('input[type="radio"]');
				if (radio) radio.checked = true;
			});
		});

		// Pre-select plan from URL param
		var urlParams = new URLSearchParams(window.location.search);
		var planParam = urlParams.get("plan");
		if (planParam) {
			var match = null;
			form.querySelectorAll(".plan-option[data-plan]").forEach(function (o) {
				if (o.getAttribute("data-plan").toLowerCase() === planParam.toLowerCase()) {
					match = o;
				}
			});
			if (match) {
				form.querySelectorAll(".plan-option").forEach(function (o) {
					o.classList.remove("selected");
				});
				match.classList.add("selected");
				var radio = match.querySelector('input[type="radio"]');
				if (radio) radio.checked = true;

				var cat = match.getAttribute("data-category");
				if (cat) {
					planTabs.forEach(function (t) {
						t.classList.toggle("active", t.getAttribute("data-category") === cat);
					});
					form.querySelectorAll(".plan-option[data-category]").forEach(function (o) {
						o.style.display = o.getAttribute("data-category") === cat ? "" : "none";
					});
				}
			}
		}

		// Country select updates currency display
		var countrySelect = form.querySelector('[name="country"]');
		if (countrySelect) {
			// Pre-select detected country
			for (var i = 0; i < countrySelect.options.length; i++) {
				if (countrySelect.options[i].value === detected.country) {
					countrySelect.selectedIndex = i;
					break;
				}
			}

			countrySelect.addEventListener("change", function () {
				var regionCode =
					typeof LucozeRegion !== "undefined"
						? LucozeRegion.getRegionForCountry(countrySelect.value)
						: "intl";
				var cur = regionCode === "in" ? "INR" : "USD";
				form.querySelectorAll(".currency-label").forEach(function (el) {
					el.textContent = cur;
				});
			});
		}

		// Form submission
		form.addEventListener("submit", function (e) {
			e.preventDefault();

			var facilityName = form.querySelector('[name="facility_name"]');
			var email = form.querySelector('[name="email"]');
			var phone = form.querySelector('[name="phone"]');
			var country = countrySelect;
			var selectedOption = form.querySelector(".plan-option.selected");
			var alert = document.getElementById("signupAlert");
			var submitBtn = form.querySelector('[type="submit"]');

			if (!facilityName || !facilityName.value.trim()) {
				showAlert(alert, "error", "Please enter your facility name.");
				return;
			}
			if (!email || !email.value.trim()) {
				showAlert(alert, "error", "Please enter your email address.");
				return;
			}
			if (!selectedOption) {
				showAlert(alert, "error", "Please select a plan.");
				return;
			}

			var selectedPlan =
				selectedOption.getAttribute("data-plan") ||
				selectedOption.querySelector('input[type="radio"]').value;
			var countryValue = country ? country.value : "";
			var emailValue = email.value.trim();

			// Determine currency from country
			var regionCode =
				typeof LucozeRegion !== "undefined"
					? LucozeRegion.getRegionForCountry(countryValue)
					: "intl";
			var currencyValue = regionCode === "in" ? "INR" : "USD";

			if (submitBtn) {
				submitBtn.classList.add("btn--loading");
				submitBtn.setAttribute("disabled", "disabled");
				submitBtn.textContent = "Creating your workspace...";
			}

			var API_BASE = window.location.hostname.includes("localhost")
				? "http://lucoze.admin.localhost:8000"
				: window.location.hostname.includes("uat-website.lucoze.com")
					? "https://admin-uat.lucoze.com"
					: "https://admin.lucoze.com";

			fetch(API_BASE + "/api/method/lucoze_admin.api.provisioning.create_tenant", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Frappe-CSRF-Token": "",
				},
				body: JSON.stringify({
					customer_name: facilityName.value.trim(),
					customer_email: emailValue,
					plan: selectedPlan,
					country: countryValue,
					currency: currencyValue,
					customer_phone: phone && phone.value.trim() ? phone.value.trim() : null,
				}),
			})
				.then(function (res) {
					return res.json().then(function (data) {
						return { ok: res.ok, data: data };
					});
				})
				.then(function (result) {
					if (result.ok) {
						showAlert(
							alert,
							"success",
							"Your workspace is being set up! You'll receive login details at " +
								emailValue +
								" shortly.",
						);
						form.reset();
						form.querySelectorAll(".plan-option").forEach(function (o) {
							o.classList.remove("selected");
						});
					} else {
						var msg =
							(result.data && result.data._server_messages) ||
							(result.data && result.data.message) ||
							"Something went wrong. Please try again.";
						showAlert(alert, "error", msg);
					}
				})
				.catch(function () {
					showAlert(alert, "error", "Network error. Please check your connection and try again.");
				})
				.finally(function () {
					if (submitBtn) {
						submitBtn.classList.remove("btn--loading");
						submitBtn.removeAttribute("disabled");
						submitBtn.textContent = "Start Your Free Trial";
					}
				});
		});
	}

	function showRegionToast(country) {
		// Remove existing toast
		var existing = document.querySelector(".region-toast");
		if (existing) existing.remove();

		var toast = document.createElement("div");
		toast.className = "region-toast";
		toast.textContent = "Showing prices for " + country;
		document.body.appendChild(toast);

		// Trigger animation
		requestAnimationFrame(function () {
			toast.classList.add("show");
		});

		// Auto-remove after 3 seconds
		setTimeout(function () {
			toast.classList.remove("show");
			setTimeout(function () {
				toast.remove();
			}, 300);
		}, 3000);
	}

	function showAlert(alertEl, type, message) {
		if (!alertEl) return;
		alertEl.className = "alert";
		alertEl.classList.add(type === "success" ? "alert--success" : "alert--error");
		alertEl.classList.add("show");
		alertEl.textContent = message;

		if (type === "success") {
			setTimeout(function () {
				alertEl.classList.remove("show");
			}, 8000);
		}
	}

	// ── Contact Form ──

	function initContact() {
		var form = document.getElementById("contactForm");
		if (!form) return;

		var urlParams = new URLSearchParams(window.location.search);
		var subjectParam = urlParams.get("subject");
		if (subjectParam) {
			var subjectSelect = form.querySelector('[name="subject"]');
			if (subjectSelect) {
				var subjectMap = {
					Pathology: "Diagnostics & Lab Plans",
					"Pathology Plus": "Diagnostics & Lab Plans",
					"Pathology+Plus": "Diagnostics & Lab Plans",
					"Pathology Network": "Diagnostics & Lab Plans",
					"Pathology+Network": "Diagnostics & Lab Plans",
					Pharmacy: "Pharmacy Plans",
					"Pharmacy Chain": "Pharmacy Plans",
					"Pharmacy+Chain": "Pharmacy Plans",
				};
				var mapped = subjectMap[subjectParam] || subjectParam;
				for (var i = 0; i < subjectSelect.options.length; i++) {
					if (subjectSelect.options[i].value === mapped) {
						subjectSelect.selectedIndex = i;
						break;
					}
				}
			}
		}

		form.addEventListener("submit", function (e) {
			e.preventDefault();

			var name = form.querySelector('[name="name"]');
			var email = form.querySelector('[name="email"]');
			var phone = form.querySelector('[name="phone"]');
			var subject = form.querySelector('[name="subject"]');
			var message = form.querySelector('[name="message"]');
			var alert = document.getElementById("contactAlert");
			var submitBtn = form.querySelector('[type="submit"]');

			if (!name || !name.value.trim()) {
				showAlert(alert, "error", "Please enter your name.");
				return;
			}
			if (!email || !email.value.trim()) {
				showAlert(alert, "error", "Please enter your email address.");
				return;
			}
			if (!subject || !subject.value) {
				showAlert(alert, "error", "Please select a subject.");
				return;
			}
			if (!message || !message.value.trim()) {
				showAlert(alert, "error", "Please enter your message.");
				return;
			}

			if (submitBtn) {
				submitBtn.classList.add("btn--loading");
				submitBtn.setAttribute("disabled", "disabled");
				submitBtn.textContent = "Sending...";
			}

			var API_BASE = window.location.hostname.includes("localhost")
				? "http://lucoze.admin.localhost:8000"
				: window.location.hostname.includes("uat-website.lucoze.com")
					? "https://admin-uat.lucoze.com"
					: "https://admin.lucoze.com";

			fetch(API_BASE + "/api/method/lucoze_admin.api.contact.submit_contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Frappe-CSRF-Token": "",
				},
				body: JSON.stringify({
					name: name.value.trim(),
					email: email.value.trim(),
					phone: phone && phone.value.trim() ? phone.value.trim() : null,
					subject: subject.value,
					message: message.value.trim(),
				}),
			})
				.then(function (res) {
					return res.json().then(function (data) {
						return { ok: res.ok, data: data };
					});
				})
				.then(function (result) {
					if (result.ok) {
						showAlert(
							alert,
							"success",
							"Thank you! We've received your message and will get back to you within 24 hours.",
						);
						form.reset();
					} else {
						var msg =
							(result.data && result.data._server_messages) ||
							(result.data && result.data.message) ||
							"Something went wrong. Please try again.";
						showAlert(alert, "error", msg);
					}
				})
				.catch(function () {
					showAlert(alert, "error", "Network error. Please check your connection and try again.");
				})
				.finally(function () {
					if (submitBtn) {
						submitBtn.classList.remove("btn--loading");
						submitBtn.removeAttribute("disabled");
						submitBtn.textContent = "Send Message";
					}
				});
		});
	}

	// ── Init ──

	document.addEventListener("DOMContentLoaded", function () {
		initTheme();
		initNavScroll();
		initMobileMenu();
		initScrollAnimations();
		initFAQ();
		initSmoothScroll();
		initCountrySelector();
		initPricing();
		initSignup();
		initContact();
	});
})();
