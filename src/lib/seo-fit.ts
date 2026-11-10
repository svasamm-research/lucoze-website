// Fit a title and a description to what search results show (Mithun, 10 Nov 2026: act on the
// Monday page checks in web-dev tools/seo_pages.py). The words are the page's; only the length is fitted:
//  - a title over 60 characters drops its brand suffix ("… | Millingo") — the part Google drops
//    first; the opening words, the ones the page ranks for, stay. A title still too long is
//    shortened by hand in its source.
//  - a description over 160 keeps as many WHOLE sentences as fit, if that is still 70 or more;
//    otherwise it is left whole, and shortened by hand in its source.
// The same rule is in svasamm-site, t4suite-site and lucoze-website; change all three.
export const TITLE_MAX = 60;
export const DESC_MAX = 160;
export const DESC_MIN = 70;

export function fitTitle(t: string): string {
	if (t.length <= TITLE_MAX) return t;
	return t.replace(/\s[|—–]\s[^|—–]+$/, "");
}

export function fitDescription(d: string): string {
	if (d.length <= DESC_MAX) return d;
	let out = "";
	for (const s of d.split(/(?<=[.!?])\s+/)) {
		const next = out ? `${out} ${s}` : s;
		if (next.length > DESC_MAX) break;
		out = next;
	}
	// A stub is worse than a long description (a 38-character first sentence was all that fit on
	// one Lucoze post, 10 Nov 2026): keep the whole text unless what fits is a real description.
	return out.length >= DESC_MIN ? out : d;
}
