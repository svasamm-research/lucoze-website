/**
 * Pricing Version Check — lightweight runtime check against billing API.
 *
 * On page load:
 * 1. Compare baked PRICING_VERSION vs billing API version
 * 2. If different, fetch updated plans and swap pricing in DOM
 * 3. If same or API unreachable, use baked prices (zero overhead)
 */
(function () {
	"use strict";

	// Baked at build time — injected by Astro as a data attribute on <body>
	var bakedVersion = parseInt(document.body.getAttribute("data-pricing-version") || "0", 10);
	var apiUrl = document.body.getAttribute("data-billing-api") || "";

	if (!apiUrl || !bakedVersion) return; // No API configured — use static prices

	// Lightweight version check — only fetches a tiny JSON
	fetch(apiUrl + "/api/method/billing.api.pricing.get_pricing_version?product_code=lucoze")
		.then(function (res) {
			return res.json();
		})
		.then(function (data) {
			var remoteVersion = (data.message || {}).version || 0;
			if (remoteVersion > bakedVersion) {
				// Version changed — fetch full plans
				fetchAndUpdatePricing(apiUrl);
			}
		})
		.catch(function () {
			// API unreachable — silently use baked prices
		});

	function fetchAndUpdatePricing(baseUrl) {
		// Get current region from localStorage or default
		var region =
			localStorage.getItem("lucoze_region") || document.body.getAttribute("data-region") || "";

		var url = baseUrl + "/api/method/billing.api.pricing.get_plans?product_code=lucoze";
		if (region) {
			url += "&region=" + encodeURIComponent(region);
		}

		fetch(url)
			.then(function (res) {
				return res.json();
			})
			.then(function (data) {
				var plans = (data.message || {}).plans || [];
				if (!plans.length) return;

				updatePricingCards(plans);
			})
			.catch(function () {
				// Failed to fetch — keep baked prices
			});
	}

	function updatePricingCards(plans) {
		plans.forEach(function (plan) {
			// Find pricing cards that match this plan name
			var cards = document.querySelectorAll('[data-plan="' + plan.plan_name + '"]');
			if (!cards.length) return;

			var prices = plan.prices || [];
			cards.forEach(function (card) {
				prices.forEach(function (price) {
					var regionKey = getRegionKeyForCurrency(price.currency);
					if (!regionKey) return;

					var amountEl = card.querySelector(".pricing-card__amount");
					if (amountEl) {
						if (price.billing_cycle === "Monthly") {
							amountEl.setAttribute("data-monthly-" + regionKey, formatAmount(price.amount));
						} else if (price.billing_cycle === "Yearly") {
							// Calculate monthly equivalent for yearly
							var monthlyEquiv = Math.round(price.amount / 12);
							amountEl.setAttribute("data-yearly-" + regionKey, formatAmount(monthlyEquiv));
						}
					}
				});
			});
		});

		// Re-trigger pricing display update if the function exists
		if (typeof window.updatePricesForRegion === "function") {
			var currentRegion = localStorage.getItem("lucoze_pricing_key") || "default";
			var isYearly = document.querySelector(".billing-toggle__input:checked") !== null;
			window.updatePricesForRegion(currentRegion, isYearly);
		}
	}

	function getRegionKeyForCurrency(currency) {
		var map = { INR: "in", USD: "default", AED: "ae", SGD: "sg", AUD: "au" };
		return map[currency] || null;
	}

	function formatAmount(amount) {
		return amount.toLocaleString("en-IN");
	}
})();
