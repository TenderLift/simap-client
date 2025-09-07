import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		exclude: ['test/**/*.worker.test.ts'],
		environment: 'node',
		setupFiles: ['test/vitest.setup.ts'],
		coverage: {
			enabled: false, // Only enable when --coverage flag is used
			reporter: ['text', 'lcov', 'html', 'clover'],
			reportsDirectory: './coverage',
			exclude: [
				'test/**',
				'dist/**',
				'*.config.*',
				'src/generated/**', // Exclude generated code from coverage
			],
		},
	},
});
