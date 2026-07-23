// Jest-only transform: lets Jest run TypeScript `src/lib/*.ts` modules
// (ESM import/export + type annotations) as CommonJS. Astro's own build
// uses Vite/esbuild, not this file — this config exists solely so `jest`
// can require() a .ts source module in tests.
module.exports = {
	presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
};
