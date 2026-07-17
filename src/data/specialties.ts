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
			"Appointments, treatment billing and imaging on the patient's record — the platform a dental group runs its day on.",
	},
	{
		id: "ivf",
		label: "IVF",
		icon: "spark",
		visualKind: "ivf",
		caption:
			"One patient, one clinical record — encounters, orders and prescriptions in a single timeline, with billing that follows the journey.",
	},
	{
		id: "derm",
		label: "Dermatology",
		icon: "sun",
		visualKind: "derm",
		caption:
			"Records, appointments and billing on one platform — the day-to-day a dermatology practice runs on.",
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
