/** Specialty selector pills — used on the home page Product Preview section.
 *  Each pill maps to a SpecialtyVisual `kind` so the static visual block
 *  can swap on click via the vanilla-JS switcher in /in/index.astro. */

export interface SpecialtyOption {
	id: string;
	label: string;
	icon: string;
	caption: string;
	/** Maps to the kind dispatched by src/components/visuals/SpecialtyVisual.astro. */
	visualKind: "multispec" | "poly" | "dental" | "ivf" | "derm" | "diag";
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
		id: "dental",
		label: "Dental",
		icon: "tooth",
		visualKind: "dental",
		caption:
			"Chair-level utilisation in real time. Treatment in progress, who's next, where the dead afternoon is forming.",
	},
	{
		id: "ivf",
		label: "IVF",
		icon: "spark",
		visualKind: "ivf",
		caption:
			"Cycle timeline rather than appointment list. 21 days, all events plotted, billing tied to the cycle — not the visit.",
	},
	{
		id: "derm",
		label: "Dermatology",
		icon: "sun",
		visualKind: "derm",
		caption:
			"Package-based view with session progress and photo anchors. Cosmetic and medical revenue stay separated.",
	},
	{
		id: "diag",
		label: "Diagnostic centre",
		icon: "flask",
		visualKind: "diag",
		caption:
			"Sample-to-report lifecycle as a Kanban. The phlebotomist, the lab, the pathologist, and the courier — all on one board.",
	},
];
