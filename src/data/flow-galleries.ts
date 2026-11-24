/**
 * Per-flow screenshot galleries. A `ProductGalleries` block on a feature or
 * solutions page renders a clickable cover per requested flow that opens a
 * lightbox of that flow's screens. Image `name`s resolve against
 * src/assets/screenshots via lib/screenshots. 3 curated, distinct shots each
 * (overview → an interaction → a detail) — a representative look, not the whole
 * product.
 */
export interface GalleryShot {
	name: string;
	alt: string;
	caption: string;
}
export interface Gallery {
	id: string;
	label: string;
	blurb: string;
	shots: GalleryShot[]; // first shot is the cover
}

export const GALLERIES: Record<string, Gallery> = {
	"front-office": {
		id: "front-office",
		label: "Front office",
		blurb: "Registration, OPD queue and appointments.",
		shots: [
			{
				name: "fo-overview",
				alt: "Lucoze OPD queue by stage, from check-in to bill",
				caption:
					"Today's OPD queue: each visit moves on as the desk, the nurse and the doctor do their part.",
			},
			{
				name: "fo-book",
				alt: "Appointments for the day in Lucoze",
				caption: "Appointments by doctor and time, with who has checked in.",
			},
			{
				name: "fo-register",
				alt: "A patient's record in Lucoze, with allergies and problems pinned",
				caption:
					"A patient's page: allergies, problems and medicines pinned, the whole history below.",
			},
		],
	},
	clinical: {
		id: "clinical",
		label: "Clinical",
		blurb: "The doctor's room — records, encounters, prescriptions.",
		shots: [
			{
				name: "clin-overview",
				alt: "The consultations list in Lucoze",
				caption: "Consultations, signed and unsigned, and results for my patients.",
			},
			{
				name: "clin-encounter",
				alt: "A consultation in Lucoze — note, orders and prescription",
				caption:
					"The consultation: vitals, the note, orders and the prescription, with the allergy check.",
			},
			{
				name: "clin-rx",
				alt: "The OPD nurse's vitals list in Lucoze",
				caption: "The OPD nurse takes vitals, longest wait first.",
			},
		],
	},
	lab: {
		id: "lab",
		label: "Laboratory",
		blurb: "Sample-to-report with an audit trail that supports NABL documentation.",
		shots: [
			{
				name: "lab-overview",
				alt: "The lab worklist by stage in Lucoze",
				caption: "The lab worklist by stage, from sample to result.",
			},
			{
				name: "lab-worklist",
				alt: "The pathologist's sign-off in Lucoze",
				caption: "The pathologist signs off, critical values first.",
			},
			{
				name: "lab-order",
				alt: "The radiology worklist in Lucoze",
				caption:
					"Radiology: the worklist and the report, release held for Form F where it applies.",
			},
		],
	},
	pharmacy: {
		id: "pharmacy",
		label: "Pharmacy",
		blurb: "Dispensing, controlled drugs and stock.",
		shots: [
			{
				name: "pharm-overview",
				alt: "Dispensing with the allergy check in Lucoze",
				caption: "Dispensing against the prescription, with the allergy and interaction check.",
			},
			{
				name: "pharm-sale",
				alt: "A pharmacy counter sale in Lucoze",
				caption: "A counter sale at the pharmacy.",
			},
			{
				name: "pharm-controlled",
				alt: "The H1 and NDPS register in Lucoze",
				caption: "The H1 and NDPS register, with its running balance.",
			},
		],
	},
	billing: {
		id: "billing",
		label: "Billing & GST",
		blurb: "GST-correct invoicing, returns and revenue.",
		shots: [
			{
				name: "bill-overview",
				alt: "Bills in Lucoze, built from what was posted",
				caption: "Bills built from what was posted: OPD, inpatient and referrals.",
			},
			{
				name: "bill-invoice",
				alt: "Dues by payer in Lucoze",
				caption: "What is owed, by payer and by age.",
			},
			{
				name: "bill-gst",
				alt: "Payments and credit notes in Lucoze",
				caption: "Payments and credit notes, each against its bill.",
			},
		],
	},
	ipd: {
		id: "ipd",
		label: "IPD & wards",
		blurb: "Admissions, bed map and inpatient care.",
		shots: [
			{
				name: "ipd-bedmap",
				alt: "The bed board in Lucoze",
				caption: "The bed board, ward by ward: occupied, free, cleaning and reserved.",
			},
			{
				name: "ipd-admit",
				alt: "Admissions in Lucoze",
				caption: "Admissions: planned and emergency, with the ward wanted.",
			},
			{
				name: "ipd-rounds",
				alt: "An inpatient's chart in Lucoze",
				caption: "An inpatient's chart: vitals, medicines due, orders and discharge.",
			},
		],
	},
	ot: {
		id: "ot",
		label: "OT & surgery",
		blurb: "Scheduling, booking and pre-op checks.",
		shots: [
			{
				name: "ot-schedule",
				alt: "The OT list by room in Lucoze",
				caption: "The theatres on the clock, and today's cases by room.",
			},
			{
				name: "ot-book",
				alt: "An OT case with the WHO checklist in Lucoze",
				caption: "An OT case: pre-op, the WHO checklist, the record and recovery.",
			},
		],
	},
	emergency: {
		id: "emergency",
		label: "Emergency",
		blurb: "Casualty intake, cases and disposition.",
		shots: [
			{
				name: "er-overview",
				alt: "The emergency board by stage in Lucoze",
				caption: "The emergency board by stage, with ambulances and triage.",
			},
			{
				name: "er-new",
				alt: "The MLC register in Lucoze",
				caption: "The medico-legal case register, with the police told.",
			},
		],
	},
	hr: {
		id: "hr",
		label: "HR & payroll",
		blurb: "Attendance, statutory payroll and staff records.",
		shots: [
			{
				name: "hr-overview",
				alt: "HR and payroll overview in Lucoze",
				caption: "HR overview — headcount, attendance and payroll at a glance.",
			},
			{
				name: "hr-attendance",
				alt: "Staff attendance in Lucoze",
				caption: "Attendance captured for a 24x7 facility.",
			},
			{
				name: "hr-payroll",
				alt: "Running payroll in Lucoze",
				caption: "Payroll run with statutory PF/ESI/TDS.",
			},
		],
	},
	insurance: {
		id: "insurance",
		label: "Insurance & TPA",
		blurb: "Cashless pre-auth, claims and settlement.",
		shots: [
			{
				name: "ins-overview",
				alt: "Insurance claims in Lucoze",
				caption: "Claims by stage, with the payer and the sanctioned amount.",
			},
			{
				name: "ins-preauth",
				alt: "Cashless pre-authorisation in Lucoze",
				caption: "Pre-authorisation for a planned cashless admission.",
			},
			{
				name: "ins-claim",
				alt: "TPA settlements in Lucoze",
				caption: "Settlements: claimed, settled and deducted.",
			},
		],
	},
};
