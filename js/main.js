"use strict";

(function () {
	// ── Region/Currency Detection ──

	function detectRegion() {
		try {
			var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
			if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) {
				return { region: "in", currency: "inr" };
			}
		} catch (e) {
			// Fallback silently
		}
		return { region: "intl", currency: "usd" };
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

		// Close menu when a link inside it is clicked
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
			// Fallback: show everything immediately
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

				// Close all other items (accordion behavior)
				item.parentElement.querySelectorAll(".faq-item.active").forEach(function (open) {
					open.classList.remove("active");
				});

				// Toggle the clicked item
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

				// Update URL without triggering scroll
				if (history.pushState) {
					history.pushState(null, "", hash);
				}
			});
		});
	}

	// ── Pricing Interactions ──

	function initPricing() {
		var region = detectRegion();
		var currency = region.currency;
		var isYearly = false;

		var billingToggle = document.getElementById("billingToggle");
		var categoryTabs = document.querySelectorAll(".pricing__tab");
		var pricingPanels = document.querySelectorAll('[id^="pricing-"]');

		if (!billingToggle && !categoryTabs.length) return;

		function updatePrices() {
			var period = isYearly ? "yearly" : "monthly";

			document.querySelectorAll(".pricing-card__amount").forEach(function (el) {
				var price = el.getAttribute("data-" + period + "-" + currency);
				if (price) {
					el.textContent = price;
				}
			});

			document.querySelectorAll(".pricing-card__annual").forEach(function (el) {
				if (isYearly) {
					var annualTotal = el.getAttribute("data-annual-" + currency);
					el.textContent = annualTotal ? "Billed " + annualTotal + " per year" : "";
				} else {
					el.textContent = "Billed monthly";
				}
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

		var region = detectRegion();

		// Plan category tabs within the signup form
		var planTabs = form.querySelectorAll(".pricing__tab[data-category]");
		planTabs.forEach(function (tab) {
			tab.addEventListener("click", function () {
				planTabs.forEach(function (t) {
					t.classList.remove("active");
				});
				tab.classList.add("active");

				var category = tab.getAttribute("data-category");
				// Show/hide plan options by category
				form.querySelectorAll(".plan-option[data-category]").forEach(function (option) {
					option.style.display = option.getAttribute("data-category") === category ? "" : "none";
				});
				// Deselect any selected plan in hidden categories
				form.querySelectorAll(".plan-option.selected").forEach(function (o) {
					if (o.getAttribute("data-category") !== category) {
						o.classList.remove("selected");
					}
				});
			});
		});

		// Plan option selection (label wraps a radio input)
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

		// Pre-select plan from URL param (case-insensitive match)
		var urlParams = new URLSearchParams(window.location.search);
		var planParam = urlParams.get("plan");
		if (planParam) {
			// Try exact match first, then case-insensitive
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

				// Activate the correct category tab
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
			countrySelect.addEventListener("change", function () {
				var cur = countrySelect.value === "India" ? "INR" : "USD";
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

			// Validate required fields
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

			// Show loading state
			if (submitBtn) {
				submitBtn.classList.add("btn--loading");
				submitBtn.setAttribute("disabled", "disabled");
				submitBtn.textContent = "Creating your workspace...";
			}

			var API_BASE = window.location.hostname.includes("localhost")
				? "http://lucoze.admin.localhost:8000"
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
					currency: countryValue === "India" ? "INR" : "USD",
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

	function showAlert(alertEl, type, message) {
		if (!alertEl) return;
		alertEl.className = "alert";
		alertEl.classList.add(type === "success" ? "alert--success" : "alert--error");
		alertEl.classList.add("show");
		alertEl.textContent = message;

		// Auto-hide success alerts after 8 seconds
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

		// Pre-fill subject from URL param (e.g. contact.html?subject=Pathology)
		var urlParams = new URLSearchParams(window.location.search);
		var subjectParam = urlParams.get("subject");
		if (subjectParam) {
			var subjectSelect = form.querySelector('[name="subject"]');
			if (subjectSelect) {
				// Map plan names to contact subjects
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
		initPricing();
		initSignup();
		initContact();
	});
})();
