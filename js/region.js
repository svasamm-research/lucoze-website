/**
 * Region detection and pricing — handles country auto-detection,
 * region-based pricing tiers, and country selector.
 *
 * Pricing tiers:
 *   in   → India (INR)
 *   me   → Middle East (USD, premium)
 *   sea  → Southeast Asia (USD, mid)
 *   af   → Africa (USD, entry)
 *   intl → US/UK/EU/AU and rest of world (USD, premium)
 */
"use strict";

var LucozeRegion = (function () {
	// ── Country → Region mapping ──
	var COUNTRY_REGION = {
		// India
		India: "in",
		// Middle East
		"United Arab Emirates": "me",
		"Saudi Arabia": "me",
		Qatar: "me",
		Bahrain: "me",
		Kuwait: "me",
		Oman: "me",
		// Southeast Asia
		Singapore: "sea",
		Malaysia: "sea",
		Indonesia: "sea",
		Thailand: "sea",
		Philippines: "sea",
		Vietnam: "sea",
		// Africa
		"South Africa": "af",
		Nigeria: "af",
		Kenya: "af",
		Ghana: "af",
		Tanzania: "af",
		Ethiopia: "af",
		// Rest → intl (US, UK, EU, AU, etc.)
	};

	// ── Timezone → Country (best-effort auto-detection) ──
	var TZ_COUNTRY = {
		"Asia/Kolkata": "India",
		"Asia/Calcutta": "India",
		"Asia/Dubai": "United Arab Emirates",
		"Asia/Riyadh": "Saudi Arabia",
		"Asia/Qatar": "Qatar",
		"Asia/Bahrain": "Bahrain",
		"Asia/Kuwait": "Kuwait",
		"Asia/Muscat": "Oman",
		"Asia/Singapore": "Singapore",
		"Asia/Kuala_Lumpur": "Malaysia",
		"Asia/Jakarta": "Indonesia",
		"Asia/Bangkok": "Thailand",
		"Asia/Manila": "Philippines",
		"Asia/Ho_Chi_Minh": "Vietnam",
		"Africa/Johannesburg": "South Africa",
		"Africa/Lagos": "Nigeria",
		"Africa/Nairobi": "Kenya",
		"Australia/Sydney": "Australia",
		"Australia/Melbourne": "Australia",
		"Pacific/Auckland": "New Zealand",
		"America/New_York": "United States",
		"America/Chicago": "United States",
		"America/Denver": "United States",
		"America/Los_Angeles": "United States",
		"America/Toronto": "Canada",
		"Europe/London": "United Kingdom",
		"Europe/Berlin": "Germany",
		"Europe/Paris": "France",
	};

	// ── Region metadata ──
	var REGIONS = {
		in: { currency: "inr", symbol: "₹", label: "India", flag: "🇮🇳" },
		me: { currency: "usd", symbol: "$", label: "Middle East", flag: "🇦🇪" },
		sea: { currency: "usd", symbol: "$", label: "Asia Pacific", flag: "🇸🇬" },
		af: { currency: "usd", symbol: "$", label: "Africa", flag: "🇰🇪" },
		intl: { currency: "usd", symbol: "$", label: "International", flag: "🌍" },
	};

	// ── Compliance badges per region ──
	var COMPLIANCE = {
		in: [
			{ label: "ABDM Ready", desc: "Ayushman Bharat Digital Mission" },
			{ label: "ABHA Compatible", desc: "Health ID integration" },
		],
		me: [
			{ label: "NABIDH Ready", desc: "Dubai Health Authority compliant" },
			{ label: "NPHIES Compatible", desc: "Saudi insurance exchange" },
		],
		sea: [{ label: "NEHR Ready", desc: "Singapore health records integration" }],
		af: [],
		intl: [
			{ label: "HL7 FHIR", desc: "International health data standard" },
			{ label: "ICD-10", desc: "Global diagnosis coding" },
		],
	};

	var STORAGE_KEY = "lucoze-country";

	// ── Public API ──

	function detectCountry() {
		// 1. Check localStorage (user previously selected)
		var saved = localStorage.getItem(STORAGE_KEY);
		if (saved && getRegionForCountry(saved)) return saved;

		// 2. Auto-detect from timezone
		try {
			var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
			if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
		} catch (e) {
			// Fallback silently
		}

		// 3. Default
		return "United States";
	}

	function getRegionForCountry(country) {
		return COUNTRY_REGION[country] || "intl";
	}

	function getRegionInfo(region) {
		return REGIONS[region] || REGIONS.intl;
	}

	function getComplianceBadges(region) {
		return COMPLIANCE[region] || [];
	}

	function setCountry(country) {
		localStorage.setItem(STORAGE_KEY, country);
	}

	function getAllCountries() {
		return Object.keys(COUNTRY_REGION).concat([
			"United States",
			"Canada",
			"United Kingdom",
			"Germany",
			"France",
			"Italy",
			"Spain",
			"Netherlands",
			"Australia",
			"New Zealand",
			"Mexico",
		]);
	}

	return {
		detectCountry: detectCountry,
		getRegionForCountry: getRegionForCountry,
		getRegionInfo: getRegionInfo,
		getComplianceBadges: getComplianceBadges,
		setCountry: setCountry,
		getAllCountries: getAllCountries,
		REGIONS: REGIONS,
	};
})();
