import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		exclude: ['test/**/*.worker.test.ts'],
		environment: 'node',
		setupFiles: ['test/vitest.setup.ts'],
	},
});
