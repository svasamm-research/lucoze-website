/** Company-page content blocks (design-partner, careers, contact).
 *  Ported verbatim from prototype `website/data-blog.js` `window.COMPANY`. */

export interface CompanyBlock {
	kicker: string;
	title: string;
	bullets: string[];
}

export interface CompanyPage {
	eyebrow: string;
	h1: string;
	highlightParts: string[];
	lead: string;
	blocks: CompanyBlock[];
}

export const COMPANY: Record<"design-partner" | "careers" | "contact", CompanyPage> = {
	"design-partner": {
		eyebrow: "Design partner program",
		h1: "Six months free. A direct line to the founder.",
		highlightParts: ["Six months free. ", "A direct line", " to the founder."],
		lead: "We're picking 10 East-India clinics to shape what Lucoze becomes. 4 of 10 slots open. Six months free on Clinic Pro or Hospital, weekly 30-minute calls with the founder, lifetime founding-customer pricing.",
		blocks: [
			{
				kicker: "What you get",
				title: "Six months. Weekly access. Founding-customer pricing for life.",
				bullets: [
					"Clinic Pro or Hospital plan — free for 6 months.",
					"Weekly 30-minute calls with the founder. Your roadmap requests skip the queue.",
					"Lifetime 20% discount once the trial ends. As long as you stay.",
					"Direct WhatsApp line during business hours. First-name basis.",
				],
			},
			{
				kicker: "What we ask of you",
				title: "Show up. Tell the truth. Let us watch.",
				bullets: [
					"Use Lucoze as your primary clinic platform during the 6 months.",
					"Be reachable on the weekly call. Tell us what's broken, in detail.",
					"Let us spend a day at your front desk every quarter. We'd come anyway.",
					"Allow us to (anonymously) reference your usage in our roadmap docs.",
				],
			},
			{
				kicker: "Who fits",
				title: "Multi-doctor East India clinics. NABH-supportive small hospitals.",
				bullets: [
					"3-15 doctor multi-specialty clinics in Kolkata, Lucknow, Patna, Bhopal, Bhubaneswar, Ranchi, Raipur, or Guwahati.",
					"20-100 bed hospitals in the same geography.",
					"Dental, IVF, derm groups that want a serious technology partner.",
					"Not for solo doctors — wrong fit, the Clinic plan trial covers that case.",
				],
			},
		],
	},
	careers: {
		eyebrow: "Careers",
		h1: "No open roles right now.",
		highlightParts: ["No open roles ", "right now", "."],
		lead: "We are not hiring as of May 2026. But the people who will join Lucoze in the next 18 months are reading this page now. So here is what we'd want you to know.",
		blocks: [
			{
				kicker: "Who we'll hire first",
				title: "GTM Lead. Then implementation lead. Then product engineer #2.",
				bullets: [
					"GTM Lead — 4-5 years B2B SaaS, India-fluent, willing to spend the first 30 days learning before selling. Position opens once we have 10 paying customers.",
					"Implementation Lead — someone who has done clinic software deployments end-to-end. Position opens once we have 25 paying customers.",
					"Product Engineer #2 — senior, opinionated, can ship full-stack across our React + Frappe stack. Opens whenever GTM lead does.",
				],
			},
			{
				kicker: "What we don't do",
				title: 'No grinding. No "family." No equity that vests over 6 years.',
				bullets: [
					"Six-hour workdays, four days a week as default — we ship more in 24 focused hours than 60 scattered ones.",
					"Open salary bands. Same role same band. Negotiate the role, not the offer.",
					"Equity vests over 4 years, with a 1-year cliff. No fancy structures.",
					"Glassdoor reviews from the team will tell you the rest, in 18 months.",
				],
			},
			{
				kicker: "What we will do",
				title: "Be honest about what's broken. Pay you to fix it.",
				bullets: [
					"Tell you exactly what's working and what isn't — before you accept.",
					"Skip-level meetings with the founder, monthly. No hierarchy theater.",
					"Travel to clinics is part of the job, every quarter. The product is built nowhere else.",
				],
			},
		],
	},
	contact: {
		eyebrow: "Contact",
		h1: "Reach Lucoze. We answer.",
		highlightParts: ["Reach Lucoze. ", "We answer", "."],
		lead: "For sales, partnerships, careers, or just a 15-minute call with the founder — here are the ways. We respond within one business day.",
		blocks: [
			{
				kicker: "Sales + demos",
				title: "Book a 30-minute walkthrough.",
				bullets: [
					"Email: sales@lucoze.com",
					"WhatsApp: +91 90077 93575 (Mon-Sat, 9am-7pm IST)",
					"Calendar: lucoze.com/demo",
				],
			},
			{
				kicker: "Founder line",
				title: "Talk to us. (We mean it.)",
				bullets: [
					"Email: mithun@lucoze.com",
					"LinkedIn DM: linkedin.com/in/mithunksingh",
					"We don't outsource the founder inbox. We read everything.",
				],
			},
			{
				kicker: "Support",
				title: "Existing customers.",
				bullets: [
					"In-app chat — fastest path. Average response under 30 minutes during business hours.",
					"WhatsApp + phone support on Clinic Pro and Hospital plans.",
					"Status page: status.lucoze.com",
				],
			},
			{
				kicker: "Office",
				title: "Svasamm Research Pvt. Ltd.",
				bullets: [
					"Registered: Konnagar, Hooghly, West Bengal 712246, India",
					"Phone: +91 90077 93575",
					"Serving: West Bengal, Bihar, Jharkhand, Odisha, UP & Northeast India",
					"Patient data: Indian data centres",
				],
			},
		],
	},
};
