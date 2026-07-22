/**
 * Single source of truth for generated OG images. Keyed by route (pathname
 * without leading/trailing slashes). Used by:
 *   - src/pages/open-graph/[...route].ts  (generates the PNG per key)
 *   - src/layouts/Base.astro              (picks the og:image for a route)
 * Keeping one map guarantees the generator and the <meta> never drift.
 */
import { getCollection } from "astro:content";
import { isPublished } from "./posts";

export interface OgPage {
	title: string;
	description: string;
}

const [blog, features, specialties, locations, compare] = await Promise.all([
	getCollection("blog"),
	getCollection("features"),
	getCollection("specialties"),
	getCollection("locations"),
	getCollection("compare"),
]);

const staticPages: Record<string, OgPage> = {
	in: {
		title: "Healthcare management software for Indian clinics & hospitals",
		description:
			"Patient records, appointments, billing, lab and pharmacy on one platform. Data in India.",
	},
	"in/pricing": {
		title: "Pricing — from ₹1,499/month",
		description:
			"Three plans for Indian clinics and hospitals. 14-day free trial. GST-compliant invoicing.",
	},
	"in/about": {
		title: "About Lucoze",
		description: "Healthcare technology built in India by Svasamm Research Pvt. Ltd.",
	},
	"in/contact": {
		title: "Contact Lucoze",
		description: "Sales, partnerships, or a 15-minute call with the founder.",
	},
	"in/demo": {
		title: "Book a demo of Lucoze",
		description: "A 30-minute product tour tuned to your clinic. Then a 14-day trial if it fits.",
	},
	"in/careers": { title: "Careers at Lucoze", description: "Building clinic software for India." },
	"in/design-partner": {
		title: "Design partner program",
		description: "Six months free. A direct line to the founder. East-India clinics prioritised.",
	},
	"in/signup": {
		title: "Start your 14-day free trial",
		description: "No credit card. Full feature access. Data hosted in India.",
	},
	"in/privacy": {
		title: "Privacy Policy",
		description: "How Lucoze handles patient and clinic data.",
	},
	"in/terms": { title: "Terms of Service", description: "The terms for using Lucoze." },
	"in/blog": {
		title: "Lucoze blog",
		description:
			"Indian healthcare compliance, EMR and clinic operations — from the team building Lucoze.",
	},
	"in/features": {
		title: "The whole clinic, on one platform",
		description:
			"Appointments, patient records, billing, lab, pharmacy and HR — built to work together.",
	},
	"in/solutions": {
		title: "Solutions for clinics, hospitals & specialties",
		description: "From a single clinic to a small hospital. One platform, tuned to how you run.",
	},
	"in/locations": {
		title: "Clinic & hospital software across India, state by state",
		description: "Built in West Bengal, for clinics across East and Northeast India.",
	},
	"in/compare": {
		title: "Lucoze, compared",
		description:
			"Honest, side-by-side comparisons against other Indian clinic and hospital software.",
	},
	"in/solutions/clinics": {
		title: "Lucoze for clinics",
		description: "Single and multi-doctor clinics, run on one platform.",
	},
	"in/solutions/hospitals": {
		title: "Lucoze for hospitals",
		description: "IPD, OT, wards and pharmacy for small hospitals.",
	},
};

export const OG_PAGES: Record<string, OgPage> = { ...staticPages };

for (const p of blog)
	if (isPublished(p.data))
		OG_PAGES[`in/blog/${p.id}`] = { title: p.data.title, description: p.data.dek };
for (const f of features)
	OG_PAGES[`in/features/${f.data.slug}`] = {
		title: f.data.label,
		description: f.data.lead.slice(0, 130),
	};
for (const s of specialties)
	OG_PAGES[`in/specialties/${s.data.slug}`] = {
		title: `${s.data.label} — clinic software`,
		description: s.data.lead.slice(0, 130),
	};
for (const l of locations)
	OG_PAGES[`in/locations/${l.data.slug}`] = {
		title: `Clinic & hospital software in ${l.data.name}`,
		description: l.data.metaDescription.slice(0, 130),
	};
for (const c of compare)
	OG_PAGES[`in/compare/${c.data.slug}`] = {
		title: `Lucoze vs ${c.data.competitor}`,
		description: c.data.metaDescription.slice(0, 130),
	};
