/**
 * Lucoze Website Visitor Tracker
 * Lightweight, cookieless visitor tracking for sales intelligence.
 * Uses localStorage for visitor ID (not a cookie).
 * Sends batched events to Lucoze Admin API.
 */
var LucozeTracker = (function () {
	var STORAGE_KEY = "lucoze-visitor-id";
	var BATCH_INTERVAL = 10000; // 10 seconds
	var ENGAGE_THRESHOLD = 60000; // 60 seconds
	var API_PATH = "/api/method/lucoze_admin.api.tracking.track_visit";

	var queue = [];
	var metadata = {};
	var visitorId = "";
	var pageLoadTime = Date.now();
	var engaged = false;
	var batchTimer = null;
	var scrollMax = 0;

	function init() {
		visitorId = _getOrCreateVisitorId();
		metadata = _collectMetadata();
		_trackPageView();
		_startEngagementTimer();
		_trackScroll();
		_setupPageExit();
		_startBatchTimer();
	}

	function _getOrCreateVisitorId() {
		var existing = localStorage.getItem(STORAGE_KEY);
		if (existing) return existing;
		var id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 9);
		localStorage.setItem(STORAGE_KEY, id);
		return id;
	}

	function _collectMetadata() {
		var params = new URLSearchParams(window.location.search);
		var regionMatch = window.location.pathname.match(/^\/(ae|sg|au|in)\//);
		return {
			region: regionMatch ? regionMatch[1] : "default",
			device_type: _getDeviceType(),
			browser_language: navigator.language || "",
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
			screen_resolution: screen.width + "x" + screen.height,
			utm_source: params.get("utm_source") || "",
			utm_medium: params.get("utm_medium") || "",
			utm_campaign: params.get("utm_campaign") || "",
			utm_content: params.get("utm_content") || "",
			referrer: document.referrer || "",
		};
	}

	function _getDeviceType() {
		var w = window.innerWidth;
		if (w <= 768) return "Mobile";
		if (w <= 1024) return "Tablet";
		return "Desktop";
	}

	function _trackPageView() {
		queue.push({
			type: "page_view",
			url: window.location.pathname,
			referrer: document.referrer || "",
			timestamp: new Date().toISOString(),
			time_on_page: 0,
			scroll_depth: 0,
		});
	}

	function _startEngagementTimer() {
		setTimeout(function () {
			engaged = true;
			queue.push({
				type: "engaged",
				timestamp: new Date().toISOString(),
			});
		}, ENGAGE_THRESHOLD);
	}

	function _trackScroll() {
		window.addEventListener("scroll", function () {
			var scrollTop = window.scrollY || document.documentElement.scrollTop;
			var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			if (docHeight > 0) {
				var percent = Math.round((scrollTop / docHeight) * 100);
				if (percent > scrollMax) scrollMax = percent;
			}
		});
	}

	function _setupPageExit() {
		document.addEventListener("visibilitychange", function () {
			if (document.visibilityState === "hidden") {
				_updatePageViewTime();
				_flush(true);
			}
		});
	}

	function _updatePageViewTime() {
		var elapsed = Math.round((Date.now() - pageLoadTime) / 1000);
		// Update the page_view event with final time and scroll
		for (var i = 0; i < queue.length; i++) {
			if (queue[i].type === "page_view" && queue[i].url === window.location.pathname) {
				queue[i].time_on_page = elapsed;
				queue[i].scroll_depth = scrollMax;
				break;
			}
		}
	}

	function _startBatchTimer() {
		batchTimer = setInterval(function () {
			_flush(false);
		}, BATCH_INTERVAL);
	}

	function _flush(useBeacon) {
		if (queue.length === 0) return;

		var eventsToSend = queue.splice(0, queue.length);
		var payload = {
			visitor_id: visitorId,
			events: JSON.stringify(eventsToSend),
			metadata: JSON.stringify(metadata),
		};

		var apiBase = _getApiBase();

		// Frappe RPC expects form-encoded or multipart data for form_dict parsing
		var formData = new FormData();
		formData.append("visitor_id", payload.visitor_id);
		formData.append("events", payload.events);
		formData.append("metadata", payload.metadata);

		if (useBeacon && navigator.sendBeacon) {
			navigator.sendBeacon(apiBase + API_PATH, formData);
		} else {
			fetch(apiBase + API_PATH, {
				method: "POST",
				headers: {
					"X-Frappe-CSRF-Token": "",
				},
				body: formData,
				keepalive: true,
			}).catch(function () {
				// Silent fail — tracking should never break the site
			});
		}
	}

	function _getApiBase() {
		var host = window.location.hostname;
		if (host === "localhost" || host === "127.0.0.1") {
			return "http://lucoze.admin.localhost:8000";
		}
		if (host.includes("uat")) {
			return "https://admin-uat.lucoze.com";
		}
		return "https://admin.lucoze.com";
	}

	// Public API for main.js integration
	function trackCTAClick(plan, region) {
		queue.push({
			type: "cta_click",
			url: window.location.pathname,
			timestamp: new Date().toISOString(),
			data: { plan: plan || "", region: region || "" },
		});
	}

	function trackFormField(field, value) {
		queue.push({
			type: "form_partial",
			timestamp: new Date().toISOString(),
			data: { field: field, value: value },
		});
	}

	function trackFormAbandon() {
		queue.push({
			type: "form_abandon",
			timestamp: new Date().toISOString(),
		});
		_flush(true);
	}

	function trackRegionChange(fromRegion, toRegion) {
		queue.push({
			type: "region_change",
			timestamp: new Date().toISOString(),
			data: { from: fromRegion, to: toRegion },
		});
	}

	function trackPlanToggle(category) {
		queue.push({
			type: "plan_toggle",
			timestamp: new Date().toISOString(),
			data: { category: category },
		});
	}

	function trackBillingToggle(cycle) {
		queue.push({
			type: "billing_toggle",
			timestamp: new Date().toISOString(),
			data: { cycle: cycle },
		});
	}

	// Expose internals for testing
	function _getQueue() {
		return queue;
	}

	function _getMetadata() {
		return metadata;
	}

	// Auto-init on load
	if (typeof document !== "undefined") {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}
	}

	return {
		trackCTAClick: trackCTAClick,
		trackFormField: trackFormField,
		trackFormAbandon: trackFormAbandon,
		trackRegionChange: trackRegionChange,
		trackPlanToggle: trackPlanToggle,
		trackBillingToggle: trackBillingToggle,
		_getQueue: _getQueue,
		_getMetadata: _getMetadata,
	};
})();

// Export for Node.js/Jest testing
if (typeof module !== "undefined" && module.exports) {
	module.exports = LucozeTracker;
}
