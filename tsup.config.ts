import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: {
		resolve: true,
		// Tell tsup to use our tsconfig
		compilerOptions: {
			composite: false,
			skipLibCheck: true,
		},
	},
	sourcemap: true,
	clean: true,
	target: 'es2020',
	treeshake: true,
	minify: false, // Standard for libraries - consumers handle minification
	// Don't bundle any dependencies - keep runtime lean
	external: [],
	// Ensure we're edge/worker compatible
	platform: 'browser',
	splitting: false,
	// Bundle all generated code together
	noExternal: [/^\.\/generated/],
	// Skip lib check for generated files
	skipNodeModulesBundle: true,
});
