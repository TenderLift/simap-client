import {defineWorkersConfig} from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		include: ['test/**/*.worker.test.ts'],
		// Runs tests inside workerd via Miniflare
		poolOptions: {
			workers: {
				miniflare: {
					compatibilityDate: '2024-12-01',
					// Add bindings here later if needed (KV, R2, etc.)
				},
			},
		},
	},
});
