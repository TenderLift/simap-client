import {defineConfig} from '@hey-api/openapi-ts';

export default defineConfig({
	input: './spec/simap.yaml',
	output: 'src/generated',
});
