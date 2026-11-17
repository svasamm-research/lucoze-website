// Long-form guides and FAQs for /in/solutions/clinics/ and /in/solutions/hospitals/ (17 Nov 2026,
// docs/lucoze-buyer-ranking-plan.md). Each page owns one search: "clinic management software" and
// "hospital management software". Claims checked against svasamm-platform origin/lucoze-v0.1:
// registration (one record across branches, UHID, duplicate check), sessions and slots, bookings,
// queue and tokens, vitals, the signed note with ICD-10 and an allergy check, the OPD bill (GST,
// discount, refund, posted to Finance). Not built yet, so "set up during onboarding": IPD, OT,
// pharmacy and lab workflow, TPA, reminders. Price: /in/pricing/ (₹1,499 a month, 14-day trial).

export interface GuideSection {
	h: string;
	p?: string[];
	list?: string[];
	links?: { href: string; label: string }[];
}

export const CLINIC_GUIDE: GuideSection[] = [
	{
		h: "What clinic management software is",
		p: [
			"Clinic management software runs the business side and the clinical side of a clinic in one system: the appointment book, the patient register, the doctor's notes and prescriptions, the bill, and the accounts behind it. It replaces the register at the front desk, the prescription pad, the billing package and the evening spent reconciling the three.",
			"For a single doctor, a good appointment app and a billing package may be enough. Once a clinic has several doctors, a nurse taking vitals, a small lab or a pharmacy counter, and perhaps a second branch, the parts have to share one record, or the staff spend their day copying between them.",
		],
	},
	{
		h: "What it should cover",
		list: [
			"Appointments and the OPD queue: doctors' sessions and leave, bookings, walk-ins and tokens.",
			"Patient records: one record per person with a UHID, vitals, the consultation note, ICD-10 diagnoses and prescriptions.",
			"Billing: the registration fee, consultation and services on one bill, discounts and refunds with a trail, GST only where it applies.",
			"Lab and pharmacy, if you have them: orders from the consultation, and stock by batch and expiry.",
			"Accounts: bills posted as they happen, not retyped into another package.",
		],
		links: [
			{ href: "/in/features/appointments/", label: "Appointments" },
			{ href: "/in/features/patient-records/", label: "Patient records" },
			{ href: "/in/features/billing/", label: "Billing" },
			{ href: "/in/features/lab/", label: "Lab" },
			{ href: "/in/features/pharmacy/", label: "Pharmacy" },
		],
	},
	{
		h: "How a visit runs in Lucoze",
		p: [
			"A patient calls or walks in. The desk finds them on the register, or registers them with a name and a mobile number; Lucoze warns if they may already be there. The desk books a slot in the doctor's session, or adds a walk-in to the doctor sitting today, and the patient gets a token. The consultation fee is taken, and the visit shows as paid.",
			"The nurse takes vitals. The doctor opens the visit with the latest vitals, allergies and past visits in front of them, records the complaints and an ICD-10 diagnosis, prescribes, and orders any tests. When the doctor signs, the orders are released and join the visit's bill. The bill and its receipt are already in the accounts.",
		],
	},
	{
		h: "How to choose between clinic software vendors",
		p: [
			"Most vendors show the same screens in a demo. The difference shows when you make the demo do your clinic's hardest day: a doctor at two branches, a patient registered twice, a discount the desk should not give alone, a note corrected after signing. Bring those cases, and ask what moving your data in costs and how long it takes.",
		],
		links: [
			{
				href: "/in/blog/best-clinic-management-software-india/",
				label: "Best clinic management software in India: how to compare",
			},
			{ href: "/in/compare/", label: "Lucoze compared" },
		],
	},
	{
		h: "What it costs",
		p: [
			"Lucoze starts at ₹1,499 a month, with a 14-day trial and no fee for moving your data in. You pay for the clinic, not for each user, so adding a receptionist does not change the bill.",
		],
		links: [{ href: "/in/pricing/", label: "See pricing" }],
	},
	{
		h: "Switching from your current software",
		p: [
			"You keep your current system running while we move your patient register, upcoming bookings and recent history in. The two run side by side until the day's totals agree, and only then does the old one become read-only. Your data stays yours: ask, and we export it.",
		],
		links: [
			{
				href: "/in/blog/switch-clinic-software-without-downtime/",
				label: "Switching without downtime",
			},
		],
	},
];

export const CLINIC_FAQS = [
	{
		q: "What is clinic management software?",
		a: "Software that runs a clinic's appointments, patient records, consultations, billing and accounts in one system, so the front desk, the doctor and the accountant work from the same record instead of separate registers.",
	},
	{
		q: "How much does clinic management software cost in India?",
		a: "Lucoze starts at ₹1,499 a month for the clinic, not per user, with a 14-day trial and no migration fee. Other vendors range from free apps for a single doctor to per-user plans for large groups.",
	},
	{
		q: "Can we move our patients from our current software?",
		a: "Yes. During onboarding we move your patient register, upcoming bookings and recent history, and run both systems side by side until the totals agree.",
	},
	{
		q: "Is it ABDM-ready?",
		a: "Yes. Each patient's ABHA number is recorded on the registration, and ABDM linking is set up for your clinic during onboarding. We also guide your HFR and HPR registration.",
	},
	{
		q: "Does it work for a clinic with two branches?",
		a: "Yes. Each patient has one record and one UHID across branches, and a doctor who sits at both cannot be double-booked at the same hour.",
	},
];

export const HOSPITAL_GUIDE: GuideSection[] = [
	{
		h: "What hospital management software has to do",
		p: [
			"Hospital management software (an HMS or HIS) runs everything a hospital does around the patient: registration and the OPD, admissions and beds, the operation theatre, the lab and radiology, the pharmacy, billing, insurance claims, staff and the accounts. In a 20 to 100 bed hospital these are usually separate packages bought over the years, and the hospital runs on the people who carry figures between them.",
			"The test of an HMS is not how many modules it lists. It is whether a patient's stay is one record from the OPD to discharge, so the final bill is built from what was done, the pharmacy knows what was prescribed, and the accountant reads entries that are already there.",
		],
	},
	{
		h: "The OPD, on the same record as the wards",
		p: [
			"Lucoze's OPD is the same for a hospital as for a clinic: one record and one UHID per patient across branches, doctors' sessions and leave, bookings, walk-ins and tokens, vitals, the signed consultation note with ICD-10 diagnoses and an allergy check on the prescription, and the OPD bill posted to the accounts. An admission starts from that record, so the ward sees the history the OPD wrote.",
		],
		links: [
			{ href: "/in/features/appointments/", label: "Appointments and the OPD queue" },
			{ href: "/in/features/patient-records/", label: "Patient records" },
		],
	},
	{
		h: "Wards, theatre, lab and pharmacy",
		p: [
			"Inpatient admission and the bed map, the operation theatre's list, the lab's sample-to-report chain and the pharmacy's batches and Schedule H1 register are set up for your hospital during onboarding, with your own wards, room categories, packages and rates. Each one adds to the same patient record and the same bill.",
		],
		links: [
			{ href: "/in/features/lab/", label: "Lab" },
			{ href: "/in/features/pharmacy/", label: "Pharmacy" },
		],
	},
	{
		h: "Billing, GST and the books",
		p: [
			"Most hospital services are exempt from GST, but cosmetic procedures, some non-medical charges and pharmacy sales are not. Lucoze marks each service as exempt or taxable with its SAC code, keeps every discount and refund with who allowed it and why, and posts every bill to the accounts as it happens, with all branches in one set of books. Deposits, running bills and TPA claims for inpatients are set up during onboarding and post to the same books.",
		],
		links: [{ href: "/in/features/billing/", label: "Hospital billing and GST" }],
	},
	{
		h: "How to choose an HMS",
		p: [
			"Make every vendor run your hardest case in the demo: a patient admitted from the OPD, operated on, put on a package with a TPA, and discharged with a pharmacy return. Ask who does the data migration and what it costs, how long the old system must run beside the new one, and how you get your data out if you leave.",
		],
		links: [
			{
				href: "/in/blog/best-hospital-management-software-india/",
				label: "Best hospital management software in India: how to choose",
			},
		],
	},
];

export const HOSPITAL_FAQS = [
	{
		q: "What is hospital management software?",
		a: "Software that runs a hospital's registration, OPD, admissions, theatre, lab, pharmacy, billing, insurance and accounts on one patient record, so a stay is billed from what was actually done.",
	},
	{
		q: "How long does it take to move a hospital onto Lucoze?",
		a: "About 60 days for a 50-bed hospital: the OPD first, the old system running alongside until the totals agree, then wards, theatre, pharmacy and lab one at a time.",
	},
	{
		q: "How is a hospital priced?",
		a: "By the hospital's size and the departments you use, quoted after a walkthrough, with no migration fee.",
	},
	{
		q: "Do hospital bills carry GST?",
		a: "Health care services are exempt, so most hospital bills carry none. Cosmetic procedures, some non-medical charges and pharmacy sales can be taxable. Lucoze marks each service as exempt or taxable and charges GST only where it applies.",
	},
];

// /in/features/ (17 Nov 2026): the hub was 82 words; it now says how the modules share one record.
export const FEATURES_GUIDE: GuideSection[] = [
	{
		h: "One patient record, every module",
		p: [
			"Most hospital and clinic software in India grew one module at a time: an appointment app, then a billing package, then a lab system bought from someone else. Each keeps its own copy of the patient, and the staff keep the copies in step. Lucoze starts from one record. The patient registered at the front desk is the same patient the nurse takes vitals for, the doctor treats, the lab tests, the pharmacy dispenses to and the bill is made out to.",
			"That is why a test the doctor orders reaches the bill without anybody typing it, why a prescription reaches the pharmacy as the doctor wrote it, and why the owner can see the whole day without asking four people.",
		],
	},
	{
		h: "What each module does",
		list: [
			"Appointments: doctors' sessions and leave, bookings, walk-ins and tokens, one queue for the day, and no doctor double-booked across branches.",
			"Patient records: one UHID per person across branches, family links, vitals, coded complaints, ICD-10 diagnoses, prescriptions with an allergy check, and signed notes that are never rewritten.",
			"Billing: the registration fee, consultation, tests and later charges on one bill; discounts and refunds with a trail; GST only on taxable services, with SAC on every line.",
			"Lab: tests ordered in the consultation and billed on the visit, with the sample-to-report chain set up for your lab.",
			"Pharmacy: dispensing from the prescription, stock by batch and expiry, GST per item, set up for your counter during onboarding.",
			"HR and payroll: attendance, leave and payroll with PF, ESI, professional tax and TDS for your staff.",
		],
	},
	{
		h: "Built on Svasamm One",
		p: [
			"Lucoze runs on Svasamm One, the platform Svasamm builds its products on. The accounts, stock and staff records are the platform's own, so a bill posts to the books as it is made, the pharmacy's stock is kept by the same rules as any store's, and the hospital's staff are paid by the same payroll that runs factories and offices. Data is hosted in India.",
		],
	},
	{
		h: "Where to start",
		p: [
			"A clinic usually starts with appointments, records and billing, and adds the lab or pharmacy when it is ready. A hospital usually starts with the OPD and moves the wards, theatre, pharmacy and lab across one at a time. Either way, your current system keeps running until the new one agrees with it.",
		],
		links: [
			{ href: "/in/solutions/clinics/", label: "For clinics" },
			{ href: "/in/solutions/hospitals/", label: "For hospitals" },
			{ href: "/in/pricing/", label: "Pricing" },
		],
	},
];

// /in/compare/ (17 Nov 2026): the hub was 77 words; it now says how to compare, not who is worse.
export const COMPARE_GUIDE: GuideSection[] = [
	{
		h: "How to compare clinic and hospital software",
		p: [
			"Every vendor's feature list looks alike, because every clinic needs appointments, records and billing. The differences are in how the parts connect, what moving in costs, and whether you can leave. The comparisons below put Lucoze beside the names Indian clinics and hospitals most often mention, on the points that decide a purchase.",
		],
	},
	{
		h: "The points that decide it",
		list: [
			"One record: does the bill, the lab and the pharmacy read the same patient record, or keep their own copies?",
			"Pricing: per clinic or per user, and what is extra (SMS, storage, modules, support)?",
			"Moving in: who moves your patients and history, what it costs, and how long both systems run together?",
			"Accounts: are bills posted to the books, or exported for an accountant to retype?",
			"GST: does each service know whether it is exempt or taxable, with its SAC code?",
			"Leaving: can you export all your data, and in what form?",
			"ABDM: is the ABHA number on the record, and who helps with HFR and HPR?",
		],
	},
	{
		h: "Run the same test on every vendor",
		p: [
			"Take one real patient day from your clinic: a booking, a walk-in, a test ordered mid-consultation, a discount, a refund. Ask each vendor to run it in the demo, end to end, and to show the accounts afterwards. The vendor whose system needs a spreadsheet beside it will need one in your clinic too.",
		],
		links: [
			{
				href: "/in/blog/best-clinic-management-software-india/",
				label: "Clinic software buying guide",
			},
			{
				href: "/in/blog/best-hospital-management-software-india/",
				label: "Hospital software buying guide",
			},
			{
				href: "/in/blog/switch-clinic-software-without-downtime/",
				label: "Switching without downtime",
			},
		],
	},
	{
		h: "When another product may suit you better",
		p: [
			"Lucoze is built for clinics with several doctors and for hospitals of 20 to 100 beds that want one record from the front desk to the accounts. A doctor working alone who only needs an appointment book and a prescription pad may be well served by a simpler, cheaper app. A large hospital chain with its own IT team and years of customisation may want a vendor that sells and runs a dedicated installation. If you are in between, with a growing clinic or a small hospital tired of carrying figures between packages, that is who Lucoze is for.",
		],
	},
];
