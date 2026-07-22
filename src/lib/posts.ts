import { getCollection } from "astro:content";

/**
 * A blog post is live once it isn't a draft AND its publish date has arrived
 * (evaluated at build time). Future-dated posts "drip" in on the next deploy
 * on/after their date — that's how we stagger a batch instead of dumping it all
 * on one day. Used by the blog index, the post pages (getStaticPaths), cluster
 * cross-links, and the OG-image map so none of them ever surface a future post.
 */
export const isPublished = (data: { draft: boolean; date: Date }): boolean =>
	!data.draft && data.date.getTime() <= Date.now();

/** All live posts, newest first. */
export const getPublishedPosts = async () => {
	const posts = await getCollection("blog", ({ data }) => isPublished(data));
	return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
};
