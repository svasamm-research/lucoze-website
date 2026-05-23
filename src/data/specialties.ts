/** Specialty selector pills — used on the home page Product Preview section.
 *  Phase C will turn this static list into a React island that swaps the
 *  DashboardMock content + caption per specialty. For now we render the pills
 *  with Multi-specialty active so the visual matches the prototype. */

export interface SpecialtyOption {
	id: string;
	label: string;
	icon: string;
	caption: string;
}

export const SPECIALTY_PILLS: SpecialtyOption[] = [
	{
		id: "multispec",
		label: "Multi-specialty",
		icon: "stethoscope",
		caption:
			"Three doctors across four departments. One patient timeline. Billing that closes the day at 7pm, not midnight.",
	},
	{ id: "poly", label: "Polyclinic", icon: "users", caption: "" },
	{ id: "dental", label: "Dental", icon: "tooth", caption: "" },
	{ id: "ivf", label: "IVF", icon: "spark", caption: "" },
	{ id: "derm", label: "Dermatology", icon: "sun", caption: "" },
	{ id: "diag", label: "Diagnostic centre", icon: "flask", caption: "" },
];
