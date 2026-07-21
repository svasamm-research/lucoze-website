/**
 * Homepage product tour. Each flow is a clickable tile (its first shot is the
 * cover) that opens a lightbox gallery of that flow's screens. Image `name`s
 * resolve against src/assets/screenshots via lib/screenshots.
 */
export interface TourShot {
	name: string;
	alt: string;
	caption: string;
}

export interface TourFlow {
	id: string;
	label: string;
	blurb: string;
	shots: TourShot[]; // first shot is the cover shown on the tile
}

export const TOUR_FLOWS: TourFlow[] = [
	{
		id: "front-office",
		label: "Front office",
		blurb: "Registration, OPD queue and appointments.",
		shots: [
			{
				name: "front-office",
				alt: "Lucoze front office — OPD queue, appointments and check-in",
				caption:
					"Front office — one moving OPD queue: walk-ins and token-holders, several doctors.",
			},
			{
				name: "booked-appointment",
				alt: "Appointment booking in Lucoze",
				caption: "Booking that starts from the department and doctor, not a blank contact form.",
			},
			{
				name: "patient-search",
				alt: "Multilingual patient search in Lucoze",
				caption: "Patient search that works for Indian names and a multilingual front desk.",
			},
		],
	},
	{
		id: "clinical",
		label: "Clinical",
		blurb: "The doctor's room — records and encounters.",
		shots: [
			{
				name: "clinical-emr",
				alt: "Clinical EMR in Lucoze",
				caption: "The consulting room — history, vitals and prescriptions on one patient timeline.",
			},
			{
				name: "clinical-dashboard",
				alt: "Clinical dashboard in Lucoze",
				caption: "A clinical dashboard the doctor reads at a glance before the patient sits down.",
			},
			{
				name: "patient-encounter",
				alt: "Patient encounter in Lucoze",
				caption: "An encounter that captures the visit without turning the doctor into a typist.",
			},
			{
				name: "patient-encounters",
				alt: "Patient encounter history in Lucoze",
				caption: "Every past visit linked on the timeline — family-linked where it should be.",
			},
		],
	},
	{
		id: "lab",
		label: "Lab",
		blurb: "Sample-to-report with an NABL-oriented trail.",
		shots: [
			{
				name: "lab-lims",
				alt: "Lab information management in Lucoze",
				caption:
					"Lab — sample-to-report tracking with reference-range flagging and a signing trail.",
			},
			{
				name: "lab-test-details",
				alt: "Lab test details in Lucoze",
				caption: "Each test tracked through collection, processing and result entry.",
			},
			{
				name: "lab-report",
				alt: "Lab report in Lucoze",
				caption: "Reports that flag out-of-range values before the pathologist signs.",
			},
		],
	},
	{
		id: "pharmacy",
		label: "Pharmacy",
		blurb: "Dispensing, inventory and procurement.",
		shots: [
			{
				name: "pharmacy",
				alt: "Pharmacy dispensing in Lucoze",
				caption: "Pharmacy — dispensing from prescriptions with batch/expiry and FEFO.",
			},
			{
				name: "inventory",
				alt: "Inventory in Lucoze",
				caption: "Stock that ties back to the shared OPD-and-pharmacy ledger.",
			},
			{
				name: "pharmacy-catalogue",
				alt: "Pharmacy catalogue and masters in Lucoze",
				caption: "A drug catalogue with Schedule-H/X handling built in.",
			},
			{
				name: "inventory-procurement",
				alt: "Procurement in Lucoze",
				caption: "Procurement and purchase tied to what actually got dispensed.",
			},
		],
	},
	{
		id: "billing",
		label: "Billing & GST",
		blurb: "GST-correct invoicing, P&L and returns.",
		shots: [
			{
				name: "finance",
				alt: "Finance and GST dashboard in Lucoze",
				caption: "Finance & GST — P&L, returns, TDS and the compliance calendar in one console.",
			},
			{
				name: "billing",
				alt: "Billing in Lucoze",
				caption: "Billing that splits CGST/SGST/IGST correctly on a mixed clinic bill.",
			},
			{
				name: "gst-returns",
				alt: "GST returns in Lucoze",
				caption: "GST returns and e-invoicing generated from the same billing data.",
			},
			{
				name: "pnl-statement",
				alt: "P&L statement in Lucoze",
				caption: "A P&L the owner can read without exporting anything to a spreadsheet.",
			},
		],
	},
	{
		id: "ipd",
		label: "IPD & wards",
		blurb: "Admissions, bed planning and inpatient care.",
		shots: [
			{
				name: "ipd-beds",
				alt: "IPD bed planning in Lucoze",
				caption: "Hospital — IPD bed planning, admissions and ward management.",
			},
			{
				name: "inpatient-admissions",
				alt: "Inpatient admissions in Lucoze",
				caption: "Admission through discharge as one record, with a consolidated IPD bill.",
			},
			{
				name: "inpatient-vitals",
				alt: "Inpatient vitals in Lucoze",
				caption: "Nursing observations recorded against the admission, not on paper.",
			},
			{
				name: "bed-planning",
				alt: "Bed planning and occupancy in Lucoze",
				caption: "A live bed map — what's free, what's occupied, by ward.",
			},
		],
	},
];
