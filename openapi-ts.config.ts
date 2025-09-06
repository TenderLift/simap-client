import {defineConfig} from '@hey-api/openapi-ts';

export default defineConfig({
	input: './spec/simap.yaml',
	output: {
		path: 'src/generated',
		clean: true,
	},
	// @ts-expect-error - client option exists in the newer version
	client: {
		name: 'fetch',
	},
});
