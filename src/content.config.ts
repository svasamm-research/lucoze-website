import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		dek: z.string(),
		category: z.string(),
		author: z.string(),
		date: z.coerce.date(),
		readMins: z.number().int().positive(),
		composite: z.boolean().default(false),
		draft: z.boolean().default(false),
		ogImage: z.string().optional(),
		// Topic-cluster grouping (hub & spoke). Posts sharing a `cluster` cross-link
		// automatically; `pillar: true` marks the cluster's hub post.
		cluster: z.string().optional(),
		pillar: z.boolean().default(false),
	}),
});

const features = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/features" }),
	schema: z.object({
		slug: z.string(),
		label: z.string(),
		icon: z.string(),
		eyebrow: z.string(),
		h1Parts: z.array(z.string()),
		lead: z.string(),
		stats: z.array(z.object({ value: z.string(), label: z.string() })),
		rows: z.array(
			z.object({
				eyebrow: z.string(),
				title: z.string(),
				lead: z.string(),
				bullets: z.array(z.string()),
				visual: z.string(),
			}),
		),
		faqs: z.array(z.object({ q: z.string(), a: z.string() })),
	}),
});

const specialties = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/specialties" }),
	schema: z.object({
		slug: z.string(),
		label: z.string(),
		icon: z.string(),
		eyebrow: z.string(),
		h1Parts: z.array(z.string()),
		lead: z.string(),
		why: z.array(z.tuple([z.string(), z.string()])),
		plan: z.string(),
		price: z.string(),
		dashSpecialty: z.string(),
		// Longer-form, specialty-specific prose sections (added to de-thin the
		// template family). Each renders as a titled paragraph below the visual.
		detail: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
		// Specialty-specific Q&A → renders on-page + as FAQPage schema.
		faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
	}),
});

const locations = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/locations" }),
	schema: z.object({
		slug: z.string(),
		kind: z.enum(["state", "city"]),
		name: z.string(), // "West Bengal", "Kolkata"
		region: z.string().default(""), // for a city: its state
		metaTitle: z.string(),
		metaDescription: z.string(),
		eyebrow: z.string(),
		h1Parts: z.array(z.string()),
		lead: z.string(),
		intro: z.string(), // unique local framing paragraph
		points: z.array(z.tuple([z.string(), z.string()])), // why Lucoze here
		localContext: z.string(), // genuinely local paragraph (languages, schemes, cities)
		citiesServed: z.array(z.string()).default([]),
		faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
	}),
});

const compare = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/compare" }),
	schema: z.object({
		slug: z.string(),
		competitor: z.string(), // "Practo Ray"
		metaTitle: z.string(),
		metaDescription: z.string(),
		eyebrow: z.string(),
		h1Parts: z.array(z.string()),
		lead: z.string(),
		intro: z.string(),
		// Lucoze-vs-competitor capability table. cells = [Lucoze, competitor].
		tableRows: z.array(
			z.object({
				label: z.string(),
				sub: z.string().optional(),
				cells: z.array(z.enum(["check", "cross", "partial", "na"])),
			}),
		),
		// Neutral, Lucoze-forward reasons to consider switching.
		points: z.array(z.tuple([z.string(), z.string()])),
		faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
		comparedOn: z.string(), // e.g. "July 2026" — for the dated disclaimer
		relatedBlog: z.object({ href: z.string(), label: z.string() }).optional(),
	}),
});

export const collections = { blog, features, specialties, locations, compare };
