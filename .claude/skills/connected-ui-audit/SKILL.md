---
name: connected-ui-audit
description: Use when fixing shared UI or CSS (a component, design token, grid, button, or form used on more than one page) — audit every page/component the change touches and VISUALLY verify at multiple viewports before shipping, so a fix doesn't move the bug elsewhere.
---

# Connected-UI audit

A change to shared UI (a component, a token in `tokens.css`, a rule in
`sections.css`/`contact-partner.css`, a `.btn` variant, a form field) ripples to
**every page that uses it**. Fixing the page you were shown is not enough, and a
single metric ("no document overflow") can hide that the bug just moved inward
(e.g. fields spilling their card). Follow this before committing a UI/CSS fix.

## 1. Map the blast radius
- `grep` the class/component/token you're touching across `src/` to list **every
  consumer**. Shared form → `/in/contact`, `/in/demo`, `/in/design-partner`.
  Shared `.btn`/token → most pages. `SubHero`/`LeadForm`/`Screenshot` → wherever imported.
- Write the list down. Every item on it must be tested, not just the reported one.

## 2. Reproduce the actual failure first
- Load the affected page in Playwright, resize to the failing width, and
  **confirm you see the bug** before changing anything. If you can't reproduce
  it, you don't understand it yet.

## 3. Test at the widths that break, not just one
- Mobile CSS bugs surface at the **narrow** end. Always check **320** (smallest
  real phones / display-zoom) and **360**, plus each breakpoint boundary
  (e.g. 560/860/980). "0 overflow at 360" ≠ fixed — 320 often still breaks.

## 4. Measure containment, not just document overflow
Document `scrollWidth === clientWidth` only means nothing sticks out of the
*page*. A field can still spill its *card*. Check both:
```js
// document overflow
document.documentElement.scrollWidth - document.documentElement.clientWidth   // want 0
// element-vs-container overflow (the one that hides in a single metric)
[...container.querySelectorAll('input,select,button,.row')]
  .filter(el => el.getBoundingClientRect().right > container.getBoundingClientRect().right + 0.5)
```

## 5. LOOK at it — take a screenshot
Numbers lie about visual breakage. `browser_take_screenshot` at the failing
width and **actually read the image**. This is non-negotiable for layout fixes —
it's the step that catches "the fix moved the overflow into the card".

## 6. Re-run 1–5 on every connected page
Screenshot/measure each consumer from step 1 (contact **and** demo **and**
design-partner, not just the one in the bug report).

## Common root cause (form/flex/grid overflow)
Grid/flex items default to `min-width: auto` (= content min-content), so they
**won't shrink below their content**. Inputs keep their ~200px intrinsic width.
Fix by letting them shrink: `min-width: 0` on the shrinking item **and**
`width: 100%; min-width: 0` on inputs/textareas (box-sizing is border-box). Do
this at the *field* level, not just the outer grid — or the overflow moves inward.
