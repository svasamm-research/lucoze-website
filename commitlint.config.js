module.exports = {
	extends: ["@commitlint/config-conventional"],
	ignores: [
		// Vanilla merge commits ("Merge branch 'develop' into uat", "Merge pull request #N ...").
		// Commitlint's defaultIgnores is meant to catch these but doesn't reliably match
		// every form we produce in promotion PRs, so be explicit.
		(message) => message.startsWith("Merge "),
		// Promotion-PR squash-merge commits ("Promote develop to uat: ...").
		// These are branch-to-branch promotions, not new conventional work.
		(message) => /^Promote\s+\w+\s+to\s+\w+/i.test(message),
	],
};
