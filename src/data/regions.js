/**
 * Region configuration — single source of truth for all region-specific content.
 * Used by Astro pages at build time and by client JS at runtime.
 */

export const REGIONS = {
	ae: {
		slug: "ae",
		name: "Middle East",
		subtitle: "Healthcare management for the Middle East",
		countries: [
			{ code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
			{ code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
			{ code: "QA", name: "Qatar", flag: "🇶🇦" },
			{ code: "BH", name: "Bahrain", flag: "🇧🇭" },
			{ code: "KW", name: "Kuwait", flag: "🇰🇼" },
			{ code: "OM", name: "Oman", flag: "🇴🇲" },
		],
		currency: "usd",
		currencySymbol: "$",
		compliance: [
			{ label: "NABIDH Ready", desc: "Dubai Health Authority compliant" },
			{ label: "NPHIES Compatible", desc: "Saudi insurance exchange ready" },
			{ label: "HL7 FHIR", desc: "International health data standard" },
			{ label: "ICD-10", desc: "Global diagnosis coding" },
		],
		pricing: {
			Clinic: { monthly: "99", yearly: "84" },
			"Clinic Pro": { monthly: "199", yearly: "169" },
			Hospital: { monthly: "399", yearly: "339" },
			"Hospital Pro": { monthly: "799", yearly: "679" },
		},
		showPathology: true,
		showPharmacy: false,
		signupEnabled: true,
		served: true,
	},
	sg: {
		slug: "sg",
		name: "Southeast Asia",
		subtitle: "Healthcare management for Southeast Asia",
		countries: [
			{ code: "SG", name: "Singapore", flag: "🇸🇬" },
			{ code: "MY", name: "Malaysia", flag: "🇲🇾" },
			{ code: "ID", name: "Indonesia", flag: "🇮🇩" },
			{ code: "TH", name: "Thailand", flag: "🇹🇭" },
			{ code: "PH", name: "Philippines", flag: "🇵🇭" },
		],
		currency: "usd",
		currencySymbol: "$",
		compliance: [
			{ label: "NEHR Ready", desc: "Singapore health records integration" },
			{ label: "HL7 FHIR", desc: "International health data standard" },
			{ label: "ICD-10", desc: "Global diagnosis coding" },
		],
		pricing: {
			Clinic: { monthly: "79", yearly: "67" },
			"Clinic Pro": { monthly: "149", yearly: "127" },
			Hospital: { monthly: "299", yearly: "254" },
			"Hospital Pro": { monthly: "499", yearly: "424" },
		},
		showPathology: true,
		showPharmacy: true,
		signupEnabled: true,
		served: true,
	},
	au: {
		slug: "au",
		name: "Australia & New Zealand",
		subtitle: "Healthcare management for Australia & New Zealand",
		countries: [
			{ code: "AU", name: "Australia", flag: "🇦🇺" },
			{ code: "NZ", name: "New Zealand", flag: "🇳🇿" },
		],
		currency: "usd",
		currencySymbol: "$",
		compliance: [
			{ label: "HL7 FHIR", desc: "International health data standard" },
			{ label: "ICD-10", desc: "Global diagnosis coding" },
			{ label: "SNOMED-CT", desc: "Clinical terminology standard" },
		],
		pricing: {
			Clinic: { monthly: "149", yearly: "127" },
			"Clinic Pro": { monthly: "299", yearly: "254" },
			Hospital: { monthly: "599", yearly: "509" },
			"Hospital Pro": { monthly: "999", yearly: "849" },
		},
		showPathology: true,
		showPharmacy: true,
		signupEnabled: true,
		served: true,
	},
	in: {
		slug: "in",
		name: "India",
		subtitle: "Healthcare management for India",
		countries: [{ code: "IN", name: "India", flag: "🇮🇳" }],
		currency: "inr",
		currencySymbol: "₹",
		compliance: [
			{ label: "ABDM Integrated", desc: "Ayushman Bharat Digital Mission" },
			{ label: "ABHA Compatible", desc: "Health ID integration" },
			{ label: "ICD-10", desc: "Global diagnosis coding" },
		],
		pricing: {
			Clinic: { monthly: "3,999", yearly: "3,399" },
			"Clinic Pro": { monthly: "7,999", yearly: "6,799" },
			Hospital: { monthly: "14,999", yearly: "12,749" },
			"Hospital Pro": { monthly: "29,999", yearly: "25,499" },
		},
		showPathology: true,
		showPharmacy: true,
		signupEnabled: true,
		served: true,
	},
	default: {
		slug: "",
		name: "International",
		subtitle: "Healthcare management simplified",
		countries: [],
		currency: "usd",
		currencySymbol: "$",
		compliance: [
			{ label: "HL7 FHIR", desc: "International health data standard" },
			{ label: "ICD-10", desc: "Global diagnosis coding" },
		],
		pricing: {
			Clinic: { monthly: "149", yearly: "127" },
			"Clinic Pro": { monthly: "299", yearly: "254" },
			Hospital: { monthly: "599", yearly: "509" },
			"Hospital Pro": { monthly: "999", yearly: "849" },
		},
		showPathology: true,
		showPharmacy: true,
		signupEnabled: false,
		served: false,
	},
};

/** Map country code (from IP detection) to region slug */
export const COUNTRY_TO_REGION = {
	AE: "ae",
	SA: "ae",
	QA: "ae",
	BH: "ae",
	KW: "ae",
	OM: "ae",
	SG: "sg",
	MY: "sg",
	ID: "sg",
	TH: "sg",
	PH: "sg",
	AU: "au",
	NZ: "au",
	IN: "in",
};

/** Get all served region slugs (for Astro static paths) */
export function getServedRegions() {
	return Object.values(REGIONS).filter((r) => r.served);
}

/** Get region config by slug, fallback to default */
export function getRegion(slug) {
	return REGIONS[slug] || REGIONS.default;
}
