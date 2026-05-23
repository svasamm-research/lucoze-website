import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		dek: z.string(),
		category: z.enum(["Field notes", "Compliance", "Buying guide", "Operations", "Product"]),
		author: z.string(),
		date: z.coerce.date(),
		readMins: z.number().int().positive(),
		composite: z.boolean().default(false),
		draft: z.boolean().default(false),
		ogImage: z.string().optional(),
	}),
});

const features = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/features" }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		eyebrow: z.string(),
		h1: z.string(),
		lead: z.string(),
		primaryCta: z.object({ label: z.string(), href: z.string() }),
		secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
		statsRow: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
		rows: z.array(
			z.object({
				eyebrow: z.string(),
				h3: z.string(),
				body: z.string(),
				bullets: z.array(z.string()).optional(),
				imageAlt: z.string(),
			}),
		),
	}),
});

const specialties = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/specialties" }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		label: z.string(),
		eyebrow: z.string(),
		h1: z.string(),
		lead: z.string(),
		why: z.array(z.tuple([z.string(), z.string()])),
	}),
});

export const collections = { blog, features, specialties };
