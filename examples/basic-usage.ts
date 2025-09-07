/**
 * Basic Usage Example
 *
 * This example demonstrates the most basic usage of the SIMAP client.
 * It shows how to configure the client and make simple API calls.
 */

import {client, listCantons, listCountries} from '@tenderlift/simap-client';

async function main() {
	// Configure the client (optional - defaults to https://www.simap.ch/api)
	client.setConfig({
		baseUrl: 'https://www.simap.ch/api',
		// Add authentication if you have a token
		// headers: {
		//   'Authorization': 'Bearer YOUR_TOKEN'
		// }
	});

	try {
		// Fetch all Swiss cantons
		console.log('Fetching Swiss cantons...');
		const cantonsResult = await listCantons();

		if (cantonsResult.data) {
			console.log(`Found ${cantonsResult.data.cantons.length} cantons:`);
			cantonsResult.data.cantons.forEach((canton) => {
				console.log(`  - ${canton.id}: ${canton.nuts3}`);
			});
		}

		console.log('\n---\n');

		// Fetch all countries
		console.log('Fetching countries...');
		const countriesResult = await listCountries();

		if (countriesResult.data) {
			console.log(
				`Found ${countriesResult.data.countries.length} countries`,
			);
			// Show first 5 countries
			countriesResult.data.countries.slice(0, 5).forEach((country) => {
				console.log(`  - ${country.isoCode}: ${country.name}`);
			});
			console.log('  ...');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

// Run the example
main().catch(console.error);
