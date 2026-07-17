/**
 * Mega-menu data — ported from prototype `website/router.jsx` MEGA.
 * URLs use `/in/` prefix per region decision (root redirects to /in/).
 */

export interface MegaItem {
	href: string;
	label: string;
	blurb?: string;
}
export interface MegaCol {
	head: string;
	items: MegaItem[];
}
export interface MegaGroup {
	key: string;
	label: string;
	cols: MegaCol[];
}

export const MEGA: MegaGroup[] = [
	{
		key: "product",
		label: "Product",
		cols: [
			{
				head: "Features",
				items: [
					{
						href: "/in/features/appointments/",
						label: "Appointments",
						blurb: "Department-first booking",
					},
					{
						href: "/in/features/patient-records/",
						label: "Patient records",
						blurb: "One timeline. Family-linked.",
					},
					{
						href: "/in/features/billing/",
						label: "Billing + accounting",
						blurb: "GST-ready. Consolidated.",
					},
					{
						href: "/in/features/lab/",
						label: "Lab module",
						blurb: "Sample-to-report tracking",
					},
					{
						href: "/in/features/pharmacy/",
						label: "Pharmacy",
						blurb: "Inventory + dispensing",
					},
					{
						href: "/in/features/hr/",
						label: "HR management",
						blurb: "Attendance + payroll",
					},
				],
			},
			{
				head: "Built for India",
				items: [
					{
						href: "/in/features/billing/",
						label: "GST + e-invoicing",
						blurb: "Multi-doctor, multi-branch",
					},
					{
						href: "/in/blog/abdm-abha-guide/",
						label: "ABDM + ABHA",
						blurb: "Issue, verify, consent",
					},
					{
						href: "/in/blog/dpdp-for-clinics/",
						label: "DPDP 2023 ready",
						blurb: "Consent, audit, breach SLA",
					},
					{
						href: "/in/blog/security-data/",
						label: "India cloud",
						blurb: "Data hosted in India",
					},
				],
			},
		],
	},
	{
		key: "solutions",
		label: "Solutions",
		cols: [
			{
				head: "By practice",
				items: [
					{ href: "/in/solutions/clinics/", label: "For clinics", blurb: "1-15 doctors" },
					{
						href: "/in/solutions/hospitals/",
						label: "For hospitals",
						blurb: "20-100 beds",
					},
				],
			},
			{
				head: "By specialty",
				items: [
					{
						href: "/in/specialties/multispecialty/",
						label: "Multi-specialty",
					},
					{ href: "/in/specialties/polyclinic/", label: "Polyclinic" },
					{ href: "/in/specialties/nursing-home/", label: "Nursing homes" },
					{ href: "/in/specialties/dental/", label: "Dental groups" },
					{ href: "/in/specialties/ivf/", label: "IVF clinics" },
					{ href: "/in/specialties/dermatology/", label: "Dermatology" },
					{ href: "/in/specialties/diagnostics/", label: "Diagnostic centres" },
					{ href: "/in/specialties/small-hospital/", label: "Small hospitals" },
				],
			},
		],
	},
	{
		key: "resources",
		label: "Resources",
		cols: [
			{
				head: "Guides",
				items: [
					{
						href: "/in/blog/abdm-abha-guide/",
						label: "ABDM & ABHA guide",
						blurb: "5-minute primer",
					},
					{
						href: "/in/blog/dpdp-for-clinics/",
						label: "DPDP for clinics",
						blurb: "One-page compliance",
					},
					{
						href: "/in/blog/security-data/",
						label: "Security & data",
						blurb: "Where your data lives",
					},
				],
			},
			{
				head: "Compare",
				items: [
					{
						href: "/in/compare/practo-ray/",
						label: "Practo Ray alternative",
						blurb: "Lucoze vs Practo Ray",
					},
					{ href: "/in/compare/", label: "All comparisons →" },
				],
			},
			{
				head: "Reading",
				items: [{ href: "/in/blog/", label: "All posts →" }],
			},
		],
	},
	{
		key: "company",
		label: "Company",
		cols: [
			{
				head: "Lucoze",
				items: [
					{
						href: "/in/design-partner/",
						label: "Design partner program",
						blurb: "6 months free · 4 of 10 open",
					},
					{ href: "/in/careers/", label: "Careers", blurb: "Not hiring yet" },
					{ href: "/in/blog/", label: "Blog" },
					{ href: "/in/contact/", label: "Contact", blurb: "Founder line included" },
				],
			},
		],
	},
];
