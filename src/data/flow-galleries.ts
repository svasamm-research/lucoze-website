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
				alt: "Lucoze front-office OPD queue overview",
				caption: "The OPD queue — walk-ins and token-holders with live wait times on one board.",
			},
			{
				name: "fo-book",
				alt: "Booking an appointment in Lucoze",
				caption: "Booking by department, doctor and slot.",
			},
			{
				name: "fo-register",
				alt: "Registering a patient in Lucoze",
				caption: "Patient registration with multilingual name capture.",
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
				alt: "Clinical EMR dashboard in Lucoze",
				caption: "The clinical dashboard — encounters, diagnoses and follow-ups at a glance.",
			},
			{
				name: "clin-encounter",
				alt: "A patient encounter in Lucoze",
				caption: "A consultation: history, vitals and orders in the doctor's room.",
			},
			{
				name: "clin-rx",
				alt: "Writing a prescription in Lucoze",
				caption: "Prescriptions written against the encounter.",
			},
		],
	},
	lab: {
		id: "lab",
		label: "Laboratory",
		blurb: "Sample-to-report with an NABL-oriented trail.",
		shots: [
			{
				name: "lab-overview",
				alt: "Laboratory overview in Lucoze",
				caption: "Lab overview — samples in the lab, TAT breaches and revenue.",
			},
			{
				name: "lab-worklist",
				alt: "Lab worklist in Lucoze",
				caption: "The worklist, sample by sample through its stages.",
			},
			{
				name: "lab-order",
				alt: "A lab order's detail in Lucoze",
				caption: "An order's detail with reference-range flagging.",
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
				alt: "Pharmacy overview in Lucoze",
				caption: "Pharmacy overview — sales, stock and dispensing.",
			},
			{
				name: "pharm-sale",
				alt: "A pharmacy counter sale in Lucoze",
				caption: "A counter sale against a prescription.",
			},
			{
				name: "pharm-controlled",
				alt: "Controlled-drug dispensing in Lucoze",
				caption: "Controlled-drug dispensing with Schedule-H/X capture.",
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
				alt: "Billing and revenue overview in Lucoze",
				caption: "Billing & revenue — collections, dues and advances.",
			},
			{
				name: "bill-invoice",
				alt: "Creating a GST invoice in Lucoze",
				caption: "A new invoice with correct CGST/SGST/IGST.",
			},
			{
				name: "bill-gst",
				alt: "GST returns in Lucoze",
				caption: "GST returns generated from the same billing data.",
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
				alt: "IPD bed map in Lucoze",
				caption: "A live bed map — occupied, free and cleaning, by ward.",
			},
			{
				name: "ipd-admit",
				alt: "Admitting an inpatient in Lucoze",
				caption: "Admitting a patient to a bed.",
			},
			{
				name: "ipd-rounds",
				alt: "Ward rounds and orders in Lucoze",
				caption: "Ward rounds, orders and eMAR against the admission.",
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
				alt: "Operation theatre schedule in Lucoze",
				caption: "The OT schedule across rooms and surgeons.",
			},
			{
				name: "ot-book",
				alt: "Booking a surgery in Lucoze",
				caption: "Booking a surgery with room, staff and time.",
			},
			{
				name: "ot-preop",
				alt: "Pre-op checklist in Lucoze",
				caption: "Pre-op checks before the case proceeds.",
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
				alt: "Emergency and casualty overview in Lucoze",
				caption: "Emergency & casualty — active cases, wait and disposition.",
			},
			{
				name: "er-new",
				alt: "A new ER visit in Lucoze",
				caption: "A new ER visit opened with the minimum to start treatment.",
			},
			{
				name: "er-case",
				alt: "Managing an emergency case in Lucoze",
				caption: "Managing an emergency case through to disposition.",
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
				alt: "Insurance and TPA overview in Lucoze",
				caption: "Insurance & TPA — claims queue, pending and settled.",
			},
			{
				name: "ins-preauth",
				alt: "Raising a cashless pre-authorisation in Lucoze",
				caption: "Raising a cashless pre-authorisation.",
			},
			{
				name: "ins-claim",
				alt: "A claim's detail in Lucoze",
				caption: "A claim's detail and supporting documents.",
			},
		],
	},
};
