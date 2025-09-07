/**
 * Error Handling Example
 *
 * This example demonstrates proper error handling techniques
 * when using the SIMAP client, including handling different
 * types of errors and using the HttpError class.
 */

import {
	client,
	HttpError,
	ensureOk,
	getPublicProjectSearch,
	getProjectHeaderById,
} from '@tenderlift/simap-client';

/**
 * Example 1: Basic error handling with try-catch
 */
async function basicErrorHandling() {
	console.log('Example 1: Basic Error Handling\n' + '='.repeat(40));

	try {
		// Try to fetch a project that doesn't exist
		const result = await getProjectHeaderById({
			path: {projectId: 'non-existent-id-12345'},
		});

		if (result.error) {
			console.log('API returned an error:', result.error);
			console.log('HTTP Status:', result.response.status);
		} else if (result.data) {
			console.log('Project found:', result.data.title);
		}
	} catch (error) {
		// Network errors or other exceptions
		console.error('Caught exception:', error);
	}
}

/**
 * Example 2: Using HttpError class for detailed error handling
 */
async function httpErrorHandling() {
	console.log('\nExample 2: Using HttpError Class\n' + '='.repeat(40));

	try {
		const result = await getProjectHeaderById({
			path: {projectId: 'invalid-id'},
		});

		if (!result.response.ok) {
			// Create HttpError from response
			const error = new HttpError(
				result.response.status,
				`Failed to fetch project: ${result.response.statusText}`,
			);

			console.log('Error Details:');
			console.log('  Status Code:', error.status);
			console.log('  Message:', error.message);
			console.log('  Response URL:', result.response.url);

			// Handle specific error codes
			switch (error.status) {
				case 404: {
					console.log('  → Project not found');
					break;
				}

				case 401: {
					console.log('  → Authentication required');
					break;
				}

				case 403: {
					console.log('  → Access forbidden');
					break;
				}

				case 429: {
					console.log('  → Rate limit exceeded');
					const retryAfter =
						result.response.headers.get('Retry-After');
					if (retryAfter) {
						console.log(`  → Retry after ${retryAfter} seconds`);
					}

					break;
				}

				case 500:
				case 502:
				case 503: {
					console.log('  → Server error - try again later');
					break;
				}

				default: {
					console.log('  → Unexpected error');
				}
			}
		}
	} catch (error) {
		console.error('Network error:', error);
	}
}

/**
 * Example 3: Using ensureOk helper
 */
async function ensureOkExample() {
	console.log('\nExample 3: Using ensureOk Helper\n' + '='.repeat(40));

	try {
		// This will throw if the response is not ok
		const result = await getPublicProjectSearch({
			query: {
				orderAddressCantons: ['INVALID'], // Invalid canton code
			},
		});

		// Use ensureOk to throw HttpError if response is not ok
		ensureOk(result.response);

		console.log('Search successful!');
		console.log(`Found ${result.data?.projects?.length || 0} projects`);
	} catch (error) {
		if (error instanceof HttpError) {
			console.log('HTTP Error caught:');
			console.log('  Status:', error.status);
			console.log('  Message:', error.message);
		} else {
			console.error('Unexpected error:', error);
		}
	}
}

/**
 * Example 4: Retry logic with exponential backoff
 */
async function retryWithBackoff() {
	console.log(
		'\nExample 4: Retry with Exponential Backoff\n' + '='.repeat(40),
	);

	const maxRetries = 3;
	let retryCount = 0;
	let lastError: Error | undefined;

	while (retryCount < maxRetries) {
		try {
			console.log(`Attempt ${retryCount + 1}/${maxRetries}...`);

			// eslint-disable-next-line no-await-in-loop
			const result = await getPublicProjectSearch({
				query: {maxResults: 5},
			});

			if (result.response.ok) {
				console.log('✅ Success!');
				console.log(
					`Found ${result.data?.projects?.length || 0} projects`,
				);
				return result;
			}

			// Handle rate limiting
			if (result.response.status === 429) {
				const retryAfter = result.response.headers.get('Retry-After');
				const delay = retryAfter
					? Number.parseInt(retryAfter, 10) * 1000
					: 2 ** retryCount * 1000;

				console.log(
					`  Rate limited. Waiting ${delay / 1000} seconds...`,
				);
				// eslint-disable-next-line no-await-in-loop
				await new Promise((resolve) => {
					setTimeout(resolve, delay);
				});
				retryCount++;
				continue;
			}

			// Don't retry on client errors (4xx except 429)
			if (result.response.status >= 400 && result.response.status < 500) {
				const error = new Error('Client error - not retrying');
				(error as any).status = result.response.status;
				throw error;
			}

			// Retry on server errors (5xx)
			if (result.response.status >= 500) {
				const delay = 2 ** retryCount * 1000;
				console.log(
					`  Server error. Waiting ${delay / 1000} seconds before retry...`,
				);
				// eslint-disable-next-line no-await-in-loop
				await new Promise((resolve) => {
					setTimeout(resolve, delay);
				});
				retryCount++;
			}
		} catch (error) {
			lastError = error as Error;
			retryCount++;

			if (retryCount < maxRetries) {
				const delay = 2 ** retryCount * 1000;
				console.log(
					`  Error occurred. Waiting ${delay / 1000} seconds before retry...`,
				);
				// eslint-disable-next-line no-await-in-loop
				await new Promise((resolve) => {
					setTimeout(resolve, delay);
				});
			}
		}
	}

	console.log('❌ Max retries exceeded');
	if (lastError) {
		throw lastError;
	}
}

/**
 * Example 5: Graceful degradation
 */
async function gracefulDegradation() {
	console.log('\nExample 5: Graceful Degradation\n' + '='.repeat(40));

	// Try to get detailed data, fall back to basic data if needed
	let projects = [];

	try {
		// Try to search with filters
		console.log('Attempting filtered search...');
		const result = await getPublicProjectSearch({
			query: {
				orderAddressCantons: ['ZH'],
				search: 'IT services',
				maxResults: 10,
			},
		});

		if (result.data?.projects) {
			projects = result.data.projects;
			console.log(`✅ Found ${projects.length} filtered projects`);
		}
	} catch {
		console.log('⚠️ Filtered search failed, trying basic search...');

		try {
			// Fall back to basic search
			const result = await getPublicProjectSearch({
				query: {maxResults: 10},
			});

			if (result.data?.projects) {
				projects = result.data.projects;
				console.log(
					`✅ Found ${projects.length} projects (basic search)`,
				);
			}
		} catch (fallbackError) {
			console.error('❌ Both searches failed:', fallbackError);
			// Use cached data or show error message to user
			console.log('Using cached/default data...');
			projects = [];
		}
	}

	// Continue with whatever data we have
	console.log(`\nProcessing ${projects.length} projects...`);
	projects.slice(0, 3).forEach((project) => {
		console.log(`  - ${project.title}`);
	});
}

// Main function to run all examples
async function main() {
	// Configure client
	client.setConfig({
		baseUrl: 'https://www.simap.ch/api',
		// Optionally configure global error handling
		// throwOnError: true, // Throw instead of returning errors
	});

	console.log(
		'SIMAP Client Error Handling Examples\n' + '='.repeat(40) + '\n',
	);

	// Run examples
	await basicErrorHandling();
	await httpErrorHandling();
	await ensureOkExample();

	// Uncomment to test retry logic (may take time)
	// await retryWithBackoff();

	await gracefulDegradation();

	console.log('\n' + '='.repeat(40));
	console.log('✅ Error handling examples completed');
}

main().catch((error: unknown) => {
	console.error('\n❌ Fatal error:', error);
	process.exit(1);
});
