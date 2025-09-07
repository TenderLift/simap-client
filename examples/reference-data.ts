/**
 * Reference Data Example
 *
 * This example demonstrates how to fetch various reference data
 * from the SIMAP API, including cantons, countries, languages,
 * CPV codes, and activity types.
 */

import {
	client,
	listCantons,
	listCountries,
	listLanguages,
	listActivities,
	getCpvCodesByDivision,
	searchCpvCodes,
} from '@tenderlift/simap-client';

async function fetchCantons() {
	console.log('📍 Swiss Cantons\n' + '='.repeat(40));

	const result = await listCantons();

	if (result.data?.cantons) {
		console.log(`Total cantons: ${result.data.cantons.length}\n`);

		result.data.cantons.forEach((canton) => {
			console.log(`${canton.id.padEnd(3)} - NUTS3: ${canton.nuts3}`);
		});
	}
}

async function fetchCountries() {
	console.log('\n🌍 Countries\n' + '='.repeat(40));

	const result = await listCountries();

	if (result.data?.countries) {
		console.log(`Total countries: ${result.data.countries.length}\n`);

		// Show some European countries
		const europeanCountries = result.data.countries
			.filter((c) => ['CH', 'DE', 'FR', 'IT', 'AT'].includes(c.isoCode))
			.sort((a, b) => a.name.localeCompare(b.name));

		console.log('Selected European countries:');
		europeanCountries.forEach((country) => {
			console.log(`  ${country.isoCode} - ${country.name}`);
		});
	}
}

async function fetchLanguages() {
	console.log('\n🗣️ Languages\n' + '='.repeat(40));

	const result = await listLanguages();

	if (result.data?.languages) {
		console.log(`Total languages: ${result.data.languages.length}\n`);

		result.data.languages.forEach((language) => {
			console.log(`  ${language.isoCode} - ${language.name}`);
		});
	}
}

async function fetchActivities() {
	console.log('\n🏢 Activity Types\n' + '='.repeat(40));

	const result = await listActivities();

	if (result.data?.activities) {
		console.log(`Total activity types: ${result.data.activities.length}\n`);

		result.data.activities.forEach((activity) => {
			console.log(`  [${activity.code}] ${activity.text}`);
		});
	}
}

async function fetchCpvCodes() {
	console.log(
		'\n📋 CPV Codes (Common Procurement Vocabulary)\n' + '='.repeat(40),
	);

	// Get CPV codes for division 45 (Construction work)
	const divisionResult = await getCpvCodesByDivision({
		path: {division: '45'},
	});

	if (divisionResult.data?.cpvCodes) {
		console.log(`Division 45 - Construction work:`);
		console.log(`Total codes: ${divisionResult.data.cpvCodes.length}\n`);

		// Show first 5 codes
		divisionResult.data.cpvCodes.slice(0, 5).forEach((cpv) => {
			console.log(`  ${cpv.code} - ${cpv.text}`);
		});
		console.log('  ...\n');
	}

	// Search for specific CPV codes
	console.log('Searching for "software" related CPV codes:');
	const searchResult = await searchCpvCodes({
		query: {search: 'software'},
	});

	if (searchResult.data?.cpvCodes) {
		console.log(`Found ${searchResult.data.cpvCodes.length} matches:\n`);

		searchResult.data.cpvCodes.slice(0, 5).forEach((cpv) => {
			console.log(`  ${cpv.code} - ${cpv.text}`);
		});
		if (searchResult.data.cpvCodes.length > 5) {
			console.log('  ...');
		}
	}
}

async function main() {
	// Configure client
	client.setConfig({
		baseUrl: 'https://www.simap.ch/api',
	});

	try {
		console.log('SIMAP Reference Data Examples\n' + '='.repeat(40) + '\n');

		// Fetch different types of reference data
		await fetchCantons();
		await fetchCountries();
		await fetchLanguages();
		await fetchActivities();
		await fetchCpvCodes();

		console.log('\n' + '='.repeat(40));
		console.log('✅ All reference data fetched successfully');
	} catch (error) {
		console.error('❌ Error fetching reference data:', error);
	}
}

main().catch(console.error);
