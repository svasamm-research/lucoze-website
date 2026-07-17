/** Specialty selector pills — used on the home page Product Preview section.
 *  Each pill maps to a SpecialtyVisual `kind` so the static visual block
 *  can swap on click via the vanilla-JS switcher in /in/index.astro.
 *  Only settings we have relevant real screenshots for are shown here;
 *  dental/IVF/derm keep their /in/specialties/ pages but are omitted from
 *  the switcher until we have specialty-configured screenshots. */

export interface SpecialtyOption {
	id: string;
	label: string;
	icon: string;
	caption: string;
	/** Maps to the kind dispatched by src/components/visuals/SpecialtyVisual.astro. */
	visualKind: "multispec" | "poly" | "nursing" | "diag" | "hospital";
}

export const SPECIALTY_PILLS: SpecialtyOption[] = [
	{
		id: "multispec",
		label: "Multi-specialty",
		icon: "stethoscope",
		visualKind: "multispec",
		caption:
			"Three doctors across four departments. One patient timeline. Billing that closes the day at 7pm, not midnight.",
	},
	{
		id: "poly",
		label: "Polyclinic",
		icon: "users",
		visualKind: "poly",
		caption:
			"Live token queue with priority insertion for walk-ins. The desk sees who's next; the doctor sees who's coming.",
	},
	{
		id: "nursing",
		label: "Nursing home",
		icon: "activity",
		visualKind: "nursing",
		caption:
			"Twenty beds, a busy front desk, admissions that become discharge summaries. Vitals, IPD billing and records on one platform.",
	},
	{
		id: "diag",
		label: "Diagnostic centre",
		icon: "flask",
		visualKind: "diag",
		caption:
			"Sample-to-report lifecycle as a Kanban. The phlebotomist, the lab, the pathologist, and the courier — all on one board.",
	},
	{
		id: "hospital",
		label: "Small hospital",
		icon: "home",
		visualKind: "hospital",
		caption:
			"IPD, OT, wards and pharmacy under one roof. Bed planning, admission-to-discharge, and the metrics NABH asks for.",
	},
];
