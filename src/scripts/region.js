/**
 * Region detection (client-side) — detects country via IP geolocation,
 * manages the country selector modal, and handles region navigation.
 */
"use strict";

var LucozeRegion = (function () {
	var STORAGE_KEY = "lucoze-region";
	var STORAGE_COUNTRY_KEY = "lucoze-country-code";

	var COUNTRY_TO_REGION = {
		AE: "ae",
		SA: "ae",
		QA: "ae",
		BH: "ae",
		KW: "ae",
		OM: "ae",
		SG: "sg",
		MY: "sg",
		ID: "sg",
		TH: "sg",
		PH: "sg",
		AU: "au",
		NZ: "au",
		IN: "in",
	};

	var SERVED_REGIONS = [
		{
			slug: "ae",
			name: "Middle East",
			countries: [
				{ code: "AE", name: "UAE", flag: "🇦🇪" },
				{ code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
				{ code: "QA", name: "Qatar", flag: "🇶🇦" },
				{ code: "BH", name: "Bahrain", flag: "🇧🇭" },
				{ code: "KW", name: "Kuwait", flag: "🇰🇼" },
				{ code: "OM", name: "Oman", flag: "🇴🇲" },
			],
		},
		{
			slug: "sg",
			name: "Southeast Asia",
			countries: [
				{ code: "SG", name: "Singapore", flag: "🇸🇬" },
				{ code: "MY", name: "Malaysia", flag: "🇲🇾" },
				{ code: "ID", name: "Indonesia", flag: "🇮🇩" },
				{ code: "TH", name: "Thailand", flag: "🇹🇭" },
				{ code: "PH", name: "Philippines", flag: "🇵🇭" },
			],
		},
		{
			slug: "au",
			name: "Australia & NZ",
			countries: [
				{ code: "AU", name: "Australia", flag: "🇦🇺" },
				{ code: "NZ", name: "New Zealand", flag: "🇳🇿" },
			],
		},
		{
			slug: "in",
			name: "India",
			countries: [{ code: "IN", name: "India", flag: "🇮🇳" }],
		},
	];

	var FLAGS = {};
	SERVED_REGIONS.forEach(function (r) {
		r.countries.forEach(function (c) {
			FLAGS[c.code] = c.flag;
		});
	});

	function detectCountry(callback) {
		var cached = localStorage.getItem(STORAGE_COUNTRY_KEY);
		var cacheTime = localStorage.getItem(STORAGE_COUNTRY_KEY + "_ts");
		if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 86400000) {
			callback(cached);
			return;
		}

		fetch("https://ipapi.co/json/")
			.then(function (res) {
				return res.json();
			})
			.then(function (data) {
				var code = data.country_code || "";
				localStorage.setItem(STORAGE_COUNTRY_KEY, code);
				localStorage.setItem(STORAGE_COUNTRY_KEY + "_ts", String(Date.now()));
				callback(code);
			})
			.catch(function () {
				callback(detectFromTimezone());
			});
	}

	function detectFromTimezone() {
		try {
			var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
			var TZ_MAP = {
				"Asia/Dubai": "AE",
				"Asia/Riyadh": "SA",
				"Asia/Qatar": "QA",
				"Asia/Bahrain": "BH",
				"Asia/Kuwait": "KW",
				"Asia/Muscat": "OM",
				"Asia/Singapore": "SG",
				"Asia/Kuala_Lumpur": "MY",
				"Asia/Jakarta": "ID",
				"Asia/Bangkok": "TH",
				"Asia/Manila": "PH",
				"Australia/Sydney": "AU",
				"Australia/Melbourne": "AU",
				"Pacific/Auckland": "NZ",
				"Asia/Kolkata": "IN",
				"Asia/Calcutta": "IN",
			};
			return TZ_MAP[tz] || "";
		} catch (e) {
			return "";
		}
	}

	function getRegionForCountry(countryCode) {
		return COUNTRY_TO_REGION[countryCode] || null;
	}

	function getFlag(countryCode) {
		return FLAGS[countryCode] || "🌍";
	}

	function getCurrentRegionSlug() {
		var path = window.location.pathname;
		var match = path.match(/^\/(ae|sg|au|in)(\/|$)/);
		return match ? match[1] : null;
	}

	function navigateToRegion(slug) {
		var currentPath = window.location.pathname;
		var cleanPath = currentPath.replace(/^\/(ae|sg|au|in)(\/|$)/, "/");
		if (cleanPath === "") cleanPath = "/";

		var newPath = slug ? "/" + slug + cleanPath : cleanPath;
		newPath = newPath.replace(/\/\//g, "/");

		localStorage.setItem(STORAGE_KEY, slug || "default");
		window.location.href = newPath;
	}

	return {
		detectCountry: detectCountry,
		getRegionForCountry: getRegionForCountry,
		getFlag: getFlag,
		getCurrentRegionSlug: getCurrentRegionSlug,
		navigateToRegion: navigateToRegion,
		SERVED_REGIONS: SERVED_REGIONS,
		STORAGE_KEY: STORAGE_KEY,
	};
})();
