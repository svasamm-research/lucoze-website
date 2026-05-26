/** Lightweight specialty list for solution-page cards.
 *  Full per-specialty content collection arrives in Phase B.4. */

export interface SpecialtyEntry {
	slug: string;
	label: string;
	icon: string;
	blurb: string;
}

export const SPECIALTIES: SpecialtyEntry[] = [
	{
		slug: "multispecialty",
		label: "Multi-specialty",
		icon: "stethoscope",
		blurb: "Indian multi-specialty clinics, 3-15 doctors. One patient timeline across departments.",
	},
	{
		slug: "polyclinic",
		label: "Polyclinic",
		icon: "users",
		blurb: "OPD + minor procedures. Front-desk-first workflows. Multi-doctor scheduling.",
	},
	{
		slug: "dental",
		label: "Dental groups",
		icon: "tooth",
		blurb: "Dental chair scheduling, treatment plans, lab job tracking, instrument inventory.",
	},
	{
		slug: "ivf",
		label: "IVF clinics",
		icon: "spark",
		blurb: "Cycle tracking, hormonal protocols, lab workflows, retrieval calendars.",
	},
	{
		slug: "dermatology",
		label: "Dermatology",
		icon: "sun",
		blurb: "Photo-based records, procedure pricing, package plans, retail products.",
	},
	{
		slug: "diagnostics",
		label: "Diagnostic centres",
		icon: "flask",
		blurb: "Sample-to-report tracking, NABL-ready audit trail, multi-collection-centre support.",
	},
];
