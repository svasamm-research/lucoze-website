/**
 * Home-page copy + FAQs.
 * Ported from prototype `website/close.jsx` (FAQS), proof.jsx (differentiation rows).
 */

export type DiffCell = "check" | "cross" | "partial" | "na";

export interface DiffRow {
	label: string;
	sub: string;
	cells: [DiffCell, DiffCell, DiffCell, DiffCell];
}

export const DIFF_ROWS: DiffRow[] = [
	{
		label: "Patient data hosted in India",
		sub: "Mumbai ap-south-1 — never crosses border",
		cells: ["check", "cross", "cross", "cross"],
	},
	{
		label: "DPDP 2023 compliant on launch",
		sub: "Consent flows, 72-hour breach reporting built-in",
		cells: ["check", "partial", "partial", "cross"],
	},
	{
		label: "One platform, all departments",
		sub: "Appointments + records + billing + lab + pharmacy + HR",
		cells: ["check", "partial", "check", "cross"],
	},
	{
		label: "Live in 14 days",
		sub: "Not a 6-month enterprise implementation",
		cells: ["check", "check", "cross", "cross"],
	},
	{
		label: "ABDM + ABHA + HPR built-in",
		sub: "Issue and verify ABHA-linked records",
		cells: ["check", "partial", "cross", "cross"],
	},
	{
		label: "Predictable monthly pricing",
		sub: "No per-user gotchas, no surprise modules",
		cells: ["check", "cross", "partial", "na"],
	},
	{
		label: "Hindi UI (Bengali, Odia next)",
		sub: "Built-in, not a half-translated overlay",
		cells: ["check", "cross", "cross", "na"],
	},
	{
		label: "Data export on demand",
		sub: "CSV + PDF, 30-day grace post-cancellation",
		cells: ["check", "partial", "cross", "na"],
	},
];

export const HOME_FAQS = [
	{
		q: "Where exactly does our patient data live?",
		a: "Every byte of patient data sits on AWS Mumbai (ap-south-1). Backups stay in India. Nothing crosses the border — not to Virginia, not to Singapore. We made this call before our first customer, and it adds ~38% to our monthly hosting bill. We pay it anyway because DPDP 2023 isn't optional in 2027 and trust takes years to rebuild.",
	},
	{
		q: "What happens to our data if Lucoze shuts down?",
		a: "Your full data exports to CSV (records, appointments, billing) and PDF (prescriptions, lab reports) within 24 hours of request. A 30-day grace period after any cancellation lets you pull everything cleanly. No lock-in, no proprietary format. We'd rather lose you to a competitor than trap you with us.",
	},
	{
		q: "Is Lucoze ABDM-ready? What about ABHA?",
		a: "Yes. Lucoze issues and verifies ABHA-linked records, supports HPR (Healthcare Professional Registry) and HFR (Health Facility Registry), and integrates with the consent manager. New patients can have an ABHA created at first visit in under 90 seconds. We use only the published NHA APIs — no shortcuts, no scraping.",
	},
	{
		q: "Can my staff actually use this? They aren't tech-savvy.",
		a: "Lucoze is built for the way Indian clinic staff actually work. Hindi UI ships in Q3 2026; Bengali and Odia after. We include a 30-minute on-site training for the front desk on every plan, plus printable cheat-sheets in the local language. Our front-desk module was redesigned after sitting through four-hour shifts at clinics in Kolkata and Patna.",
	},
	{
		q: "We're already on Practo Ray / Halemind / Cliniq360. Is migration painful?",
		a: "We've built importers for the common formats. Practo Ray exports give us appointments + patient list directly; we map clinical notes manually for the first ten patients with you on a call, so the team can see the migration working before trusting it. Most clinics are fully migrated in 10-14 days, parallel-running until everyone is ready to switch.",
	},
	{
		q: "What does the design-partner program actually offer?",
		a: "Six months free on Clinic Pro or Hospital plan. Weekly 30-minute calls with the founder. You influence the roadmap directly — features you ask for ship before features we'd planned. Lifetime founding-customer pricing (20% off list) for as long as you stay. East-India clinics prioritised. Only 4 slots remain of the original 10.",
	},
	{
		q: "Do you offer onboarding support? What's included?",
		a: "Every plan includes data migration assistance, a 30-minute staff training, printable cheat-sheets, and 14 days of dedicated chat support from the implementation team. Hospital plan adds a named implementation manager for 60 days. After that, support runs via in-app chat (Clinic), WhatsApp + phone (Clinic Pro), and a dedicated CSM line (Hospital).",
	},
];
