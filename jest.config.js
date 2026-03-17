module.exports = {
	testEnvironment: "jsdom",
	setupFiles: ["<rootDir>/tests/setup.js"],
	roots: ["<rootDir>/tests"],
	testMatch: ["**/*.test.js"],
	collectCoverageFrom: ["js/**/*.js"],
	coverageThreshold: {
		global: {
			lines: 50,
		},
	},
};
