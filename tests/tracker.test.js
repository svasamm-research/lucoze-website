/**
 * Tests for LucozeTracker (public/js/tracker.js)
 * @jest-environment jsdom
 */

describe("LucozeTracker", () => {
  let tracker;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ status: "ok" }) }),
    );
    navigator.sendBeacon = jest.fn(() => true);
    jest.resetModules();
  });

  function loadTracker() {
    tracker = require("../public/js/tracker.js");
    return tracker;
  }

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // ── Visitor ID ──

  test("generates and persists visitor ID in localStorage", () => {
    loadTracker();
    const vid = localStorage.getItem("lucoze-visitor-id");
    expect(vid).toBeTruthy();
    expect(vid).toMatch(/^v_/);
    expect(vid.length).toBeGreaterThan(10);
  });

  test("reuses existing visitor ID across page loads", () => {
    localStorage.setItem("lucoze-visitor-id", "v_existing_123");
    loadTracker();
    const vid = localStorage.getItem("lucoze-visitor-id");
    expect(vid).toBe("v_existing_123");
  });

  // ── Page View Tracking ──

  test("queues page_view event on init", () => {
    loadTracker();
    const queue = tracker._getQueue();
    expect(queue.length).toBeGreaterThanOrEqual(1);
    const pageView = queue.find((e) => e.type === "page_view");
    expect(pageView).toBeTruthy();
    expect(pageView.timestamp).toBeTruthy();
  });

  // ── Engagement Timer ──

  test("fires engaged event after 60 seconds", () => {
    loadTracker();
    // Advance past 60s + next 10s batch (70s) so engaged event is flushed via fetch
    jest.advanceTimersByTime(71000);
    // The engaged event should have been sent via fetch in one of the batches
    const fetchCalls = global.fetch.mock.calls;
    const allPayloads = fetchCalls.map((c) => JSON.parse(c[1].body));
    const allEvents = allPayloads.flatMap((p) => JSON.parse(p.events));
    const engaged = allEvents.find((e) => e.type === "engaged");
    expect(engaged).toBeTruthy();
    expect(engaged.timestamp).toBeTruthy();
  });

  test("does not fire engaged event before 60 seconds", () => {
    loadTracker();
    jest.advanceTimersByTime(30000);
    const queue = tracker._getQueue();
    const engaged = queue.find((e) => e.type === "engaged");
    expect(engaged).toBeUndefined();
  });

  // ── CTA Click Tracking ──

  test("tracks CTA click with plan and region", () => {
    loadTracker();
    tracker.trackCTAClick("Hospital Pro", "ae");
    const queue = tracker._getQueue();
    const cta = queue.find((e) => e.type === "cta_click");
    expect(cta).toBeTruthy();
    expect(cta.data.plan).toBe("Hospital Pro");
    expect(cta.data.region).toBe("ae");
  });

  test("tracks CTA click with empty plan gracefully", () => {
    loadTracker();
    tracker.trackCTAClick("", "");
    const queue = tracker._getQueue();
    const cta = queue.find((e) => e.type === "cta_click");
    expect(cta).toBeTruthy();
    expect(cta.data.plan).toBe("");
  });

  // ── Form Field Tracking ──

  test("tracks form field blur with field name and value", () => {
    loadTracker();
    tracker.trackFormField("email", "dr@hospital.ae");
    const queue = tracker._getQueue();
    const formEvent = queue.find((e) => e.type === "form_partial");
    expect(formEvent).toBeTruthy();
    expect(formEvent.data.field).toBe("email");
    expect(formEvent.data.value).toBe("dr@hospital.ae");
  });

  test("tracks multiple form fields independently", () => {
    loadTracker();
    tracker.trackFormField("email", "dr@test.com");
    tracker.trackFormField("facility_name", "Apollo Clinic");
    tracker.trackFormField("plan", "Clinic Pro");

    const queue = tracker._getQueue();
    const formEvents = queue.filter((e) => e.type === "form_partial");
    expect(formEvents).toHaveLength(3);
    expect(formEvents[0].data.field).toBe("email");
    expect(formEvents[1].data.field).toBe("facility_name");
    expect(formEvents[2].data.field).toBe("plan");
  });

  // ── Form Abandon ──

  test("tracks form abandon and flushes via sendBeacon", () => {
    loadTracker();
    tracker.trackFormAbandon();
    expect(navigator.sendBeacon).toHaveBeenCalled();
  });

  // ── Region Change Tracking ──

  test("tracks region change with from/to", () => {
    loadTracker();
    tracker.trackRegionChange("in", "ae");
    const queue = tracker._getQueue();
    const change = queue.find((e) => e.type === "region_change");
    expect(change).toBeTruthy();
    expect(change.data.from).toBe("in");
    expect(change.data.to).toBe("ae");
  });

  // ── Plan Toggle Tracking ──

  test("tracks plan category toggle", () => {
    loadTracker();
    tracker.trackPlanToggle("hospital");
    const queue = tracker._getQueue();
    const toggle = queue.find((e) => e.type === "plan_toggle");
    expect(toggle).toBeTruthy();
    expect(toggle.data.category).toBe("hospital");
  });

  // ── Billing Toggle Tracking ──

  test("tracks billing cycle toggle", () => {
    loadTracker();
    tracker.trackBillingToggle("yearly");
    const queue = tracker._getQueue();
    const toggle = queue.find((e) => e.type === "billing_toggle");
    expect(toggle).toBeTruthy();
    expect(toggle.data.cycle).toBe("yearly");
  });

  // ── Metadata Collection ──

  test("collects UTM params from URL", () => {
    delete window.location;
    window.location = new URL(
      "https://lucoze.com/ae/?utm_source=google&utm_medium=cpc&utm_campaign=gcc",
    );
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.utm_source).toBe("google");
    expect(meta.utm_medium).toBe("cpc");
    expect(meta.utm_campaign).toBe("gcc");
  });

  test("detects region from URL path", () => {
    delete window.location;
    window.location = new URL("https://lucoze.com/sg/pricing");
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.region).toBe("sg");
  });

  test("defaults to 'default' region for unsupported paths", () => {
    delete window.location;
    window.location = new URL("https://lucoze.com/pricing");
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.region).toBe("default");
  });

  test("collects browser language", () => {
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.browser_language).toBeTruthy();
  });

  test("collects screen resolution", () => {
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.screen_resolution).toMatch(/\d+x\d+/);
  });

  // ── Batch Flushing ──

  test("flushes events via fetch every 10 seconds", () => {
    loadTracker();
    jest.advanceTimersByTime(10500);
    expect(global.fetch).toHaveBeenCalled();
  });

  // ── Device Type Detection ──

  test("detects desktop for wide screens", () => {
    Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.device_type).toBe("Desktop");
  });

  test("detects mobile for narrow screens", () => {
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.device_type).toBe("Mobile");
  });

  test("detects tablet for medium screens", () => {
    Object.defineProperty(window, "innerWidth", { value: 800, writable: true });
    loadTracker();
    const meta = tracker._getMetadata();
    expect(meta.device_type).toBe("Tablet");
  });
});
