/**
 * Search Projects Example
 *
 * This example demonstrates how to search for public procurement projects
 * using various filters and parameters.
 */

import {
	client,
	getProjectHeaderById,
	getPublicProjectSearch
} from '@tenderlift/simap-client';

async function searchProjects() {
	console.log('Searching for projects in Ticino canton...\n');

	// Search for projects in Ticino canton
	const searchResult = await getPublicProjectSearch({
		query: {
			orderAddressCantons: ['TI'], // Canton Ticino
			search: 'construction', // Search term
			orderDateFrom: '2024-01-01', // Projects from 2024
			maxResults: 5, // Limit results
		},
	});

	if (!searchResult.data?.projects) {
		console.log('No projects found');
		return;
	}

	const {projects} = searchResult.data;
	console.log(`Found ${projects.length} projects:\n`);

	// Display project summaries
	for (const project of projects) {
		console.log(`📋 Project: ${project.title}`);
		console.log(`   ID: ${project.id}`);
		console.log(`   Type: ${project.projectType}`);
		console.log(`   Status: ${project.status}`);
		console.log(`   Deadline: ${project.submissionDeadline || 'N/A'}`);
		console.log(`   Canton: ${project.orderAddress?.canton || 'N/A'}`);
		console.log('');
	}
}

async function getProjectDetails(projectId: string) {
	console.log(`\nFetching details for project ${projectId}...\n`);

	const result = await getProjectHeaderById({
		path: {projectId},
	});

	if (!result.data) {
		console.log('Project not found');
		return;
	}

	const project = result.data;
	console.log('Project Details:');
	console.log('================');
	console.log(`Title: ${project.title}`);
	console.log(`Description: ${project.description || 'N/A'}`);
	console.log(`Type: ${project.projectType}`);
	console.log(`Status: ${project.status}`);

	if (project.orderAddress) {
		console.log('\nContracting Authority:');
		console.log(`  Name: ${project.orderAddress.name}`);
		console.log(`  City: ${project.orderAddress.city}`);
		console.log(`  Canton: ${project.orderAddress.canton}`);
	}

	if (project.cpvCodes && project.cpvCodes.length > 0) {
		console.log('\nCPV Codes:');
		project.cpvCodes.forEach((code) => {
			console.log(`  - ${code.code}: ${code.text}`);
		});
	}
}

async function searchWithPagination() {
	console.log('\nSearching with pagination...\n');

	let offset = 0;
	const pageSize = 10;
	let hasMore = true;
	let totalFetched = 0;

	while (hasMore && totalFetched < 30) {
		const result = await getPublicProjectSearch({
			query: {
				maxResults: pageSize,
				offset,
				orderAddressCantons: ['ZH'], // Zurich canton
			},
		});

		if (!result.data?.projects || result.data.projects.length === 0) {
			hasMore = false;
			break;
		}

		const {projects} = result.data;
		totalFetched += projects.length;

		console.log(
			`Page ${offset / pageSize + 1}: Fetched ${projects.length} projects`,
		);

		// Check if there are more results
		if (projects.length < pageSize) {
			hasMore = false;
		} else {
			offset += pageSize;
		}
	}

	console.log(`\nTotal projects fetched: ${totalFetched}`);
}

// Main function to run examples
async function main() {
	// Configure client
	client.setConfig({
		baseUrl: 'https://www.simap.ch/api',
	});

	try {
		// Run search examples
		await searchProjects();

		// Uncomment to test project details
		// await getProjectDetails('some-project-id');

		// Uncomment to test pagination
		// await searchWithPagination();
	} catch (error) {
		console.error('Error:', error);
	}
}

main().catch(console.error);
