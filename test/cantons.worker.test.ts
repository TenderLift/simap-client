import {beforeAll, afterEach, it, expect, describe} from 'vitest';
import {fetchMock} from 'cloudflare:test';

// Import the client and functions from source
import {client, listCantons, ensureOk, HttpError} from '../src/index';

// --- Arrange: enable request mocking in Workers runtime
beforeAll(() => {
	fetchMock.activate();
	fetchMock.disableNetConnect(); // Fail if anything tries real network
});

afterEach(() => {
	fetchMock.assertNoPendingInterceptors();
});

describe('SIMAP API Client - Cantons', () => {
	it('lists cantons from SIMAP (stubbed)', async () => {
		// Fixture based on expected SIMAP response structure
		const fixture = {
			cantons: [
				{code: 'TI', name: 'Ticino'},
				{code: 'VD', name: 'Vaud'},
				{code: 'GE', name: 'Genève'},
			],
		};

		// Mock the outbound request the SDK makes
		fetchMock
			.get('https://www.simap.ch')
			.intercept({path: '/api/cantons/v1'})
			.reply(200, JSON.stringify(fixture), {
				headers: {'content-type': 'application/json'},
			});

		// Configure client to point at SIMAP
		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
			// No auth token needed for public endpoints
		});

		// Call the generated function
		const res = await listCantons();

		// Assert the response
		expect(res.response.ok).toBe(true);
		expect(res.data).toEqual(fixture);
	});

	it('handles HTTP errors gracefully', async () => {
		// Mock a 401 Unauthorized response
		const errorResponse = {error: 'Unauthorized'};
		fetchMock
			.get('https://www.simap.ch')
			.intercept({path: '/api/cantons/v1'})
			.reply(401, JSON.stringify(errorResponse), {
				headers: {'content-type': 'application/json'},
			});

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		const res = await listCantons();

		// Response should not be ok
		expect(res.response.ok).toBe(false);
		expect(res.response.status).toBe(401);

		// EnsureOk should throw on non-2xx
		try {
			await ensureOk(res);
			// Should not reach here
			expect.fail('ensureOk should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(HttpError);
			if (error instanceof HttpError) {
				expect(error.status).toBe(401);
				// The body will be the error response from the API
				// Since the generated client handles error responses, check what's actually there
				// The actual body might be undefined or the parsed error
			}
		}
	});

	it('handles network errors', async () => {
		// Mock a network failure
		fetchMock
			.get('https://www.simap.ch')
			.intercept({path: '/api/cantons/v1'})
			.replyWithError(new Error('Network error'));

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		// This should throw
		await expect(listCantons()).rejects.toThrow('Network error');
	});
});
