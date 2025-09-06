import fs from 'node:fs/promises';
import path from 'node:path';

const SPEC_URL = 'https://www.simap.ch/api/specifications/simap.yaml';
const OUTPUT_PATH = path.resolve(__dirname, '../spec/simap.upstream.yaml');

async function fetchSpec() {
	try {
		console.log(`Fetching latest OpenAPI spec from ${SPEC_URL}...`);
		const response = await fetch(SPEC_URL);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch spec: ${response.status} ${response.statusText}`,
			);
		}

		const specContent = await response.text();

		await fs.writeFile(OUTPUT_PATH, specContent, 'utf-8');
		console.log(
			`✅ Successfully saved latest spec to ${path.relative(process.cwd(), OUTPUT_PATH)}`,
		);
	} catch (error) {
		console.error('🔴 Error fetching or saving the spec:', error);
		process.exit(1);
	}
}

fetchSpec();
