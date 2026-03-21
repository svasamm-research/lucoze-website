/**
 * Page metadata for generating region-specific pages.
 * Each page defines its title template, description, and region-specific overrides.
 */

export const PAGES = {
	index: {
		title: (region) =>
			region.served
				? `Lucoze — Healthcare Management Software for ${region.name}`
				: "Lucoze — Healthcare Management Software",
		description: (region) =>
			region.served
				? `Complete healthcare management for clinics and hospitals in ${region.name}. ${region.compliance.map((c) => c.label).join(", ")} compliant. Start your free 14-day trial.`
				: "Complete healthcare management platform for clinics, hospitals, and diagnostic centres. Start your free trial.",
	},
	signup: {
		title: () => "Sign Up — Lucoze Healthcare Management",
		description: () =>
			"Start your free 14-day trial of Lucoze healthcare management. No credit card required.",
	},
	"solutions-clinics": {
		title: (region) =>
			region.served
				? `Clinic Management Software — Lucoze ${region.name}`
				: "Clinic & Polyclinic Management Software — Lucoze",
		description: () =>
			"Lucoze for clinics — appointments, patient encounters, prescriptions, billing, and practice management.",
	},
	"solutions-hospitals": {
		title: (region) =>
			region.served
				? `Hospital Management Software — Lucoze ${region.name}`
				: "Hospital Management Software — Lucoze",
		description: () =>
			"Lucoze for hospitals — inpatient management, departments, OT scheduling, HR, payroll, and complete hospital ERP.",
	},
	"solutions-diagnostics": {
		title: (region) =>
			region.served
				? `Diagnostic Centre Software — Lucoze ${region.name}`
				: "Diagnostic Centre Software — Lucoze",
		description: () =>
			"Lucoze for diagnostic centres — lab workflow, sample management, result entry, quality control.",
	},
	"solutions-pharmacies": {
		title: (region) =>
			region.served
				? `Pharmacy Management Software — Lucoze ${region.name}`
				: "Pharmacy Management Software — Lucoze",
		description: () =>
			"Lucoze for pharmacies — dispensing, inventory, billing, procurement, and multi-store management.",
	},
	contact: {
		title: () => "Contact Us — Lucoze",
		description: () => "Get in touch with the Lucoze team for demos, pricing, and support.",
	},
	about: {
		title: () => "About Lucoze — Healthcare Technology Company",
		description: () =>
			"Learn about Lucoze and our mission to simplify healthcare management worldwide.",
	},
	privacy: {
		title: () => "Privacy Policy — Lucoze",
		description: () => "Lucoze privacy policy.",
	},
	terms: {
		title: () => "Terms of Service — Lucoze",
		description: () => "Lucoze terms and conditions of service.",
	},
};
