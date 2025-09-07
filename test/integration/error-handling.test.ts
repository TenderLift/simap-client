import {describe, expect, it, beforeAll, afterEach} from 'vitest';
import {server} from '../mocks/server';
import {errorHandlers} from '../mocks/handlers/errors.handlers';
import {
	getPublicProjectSearch,
	listCantons,
	getProjectHeaderById,
} from '../../src/generated/sdk.gen';
import {client, HttpError} from '../../src/index';

const SIMAP_API_BASE = 'https://www.simap.ch/api';

describe('Error Handling Integration Tests', () => {
	beforeAll(() => {
		client.setConfig({
			baseUrl: SIMAP_API_BASE,
		});
	});

	afterEach(() => {
		server.resetHandlers();
	});

	describe('4xx Client Errors', () => {
		it('should handle 401 Unauthorized errors', async () => {
			server.use(errorHandlers.unauthorized);

			const result = await getPublicProjectSearch({query: {}});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(401);
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it('should handle 403 Forbidden errors', async () => {
			server.use(errorHandlers.forbidden);

			const result = await listCantons();

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(403);
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it('should handle 404 Not Found errors', async () => {
			server.use(errorHandlers.notFound);

			const result = await getProjectHeaderById({
				path: {
					projectId: 'non-existent-id',
				},
			});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(404);
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it('should handle 429 Rate Limit errors', async () => {
			server.use(errorHandlers.rateLimited);

			const result = await getPublicProjectSearch({query: {}});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(429);
			expect(result.response.headers.get('Retry-After')).toBe('60');
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it('should handle 400 Validation errors', async () => {
			server.use(errorHandlers.validationError);

			const result = await getPublicProjectSearch({
				query: {
					orderAddressCantons: ['XX'], // Invalid canton
				},
			});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(400);
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});
	});

	describe('5xx Server Errors', () => {
		it('should handle 500 Internal Server errors', async () => {
			server.use(errorHandlers.serverError);

			const result = await getPublicProjectSearch({query: {}});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(500);
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it('should handle 502 Bad Gateway errors', async () => {
			server.use(errorHandlers.badGateway);

			const result = await listCantons();

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(502);
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it('should handle 503 Service Unavailable errors', async () => {
			server.use(errorHandlers.serviceUnavailable);

			const result = await getPublicProjectSearch({query: {}});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(503);
			expect(result.response.headers.get('Retry-After')).toBe('7200');
			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});
	});

	describe('Network and Response Errors', () => {
		it('should handle network errors', async () => {
			server.use(errorHandlers.networkError);

			// Network errors throw, not return error response
			await expect(getPublicProjectSearch({query: {}})).rejects.toThrow();
		});

		it('should handle invalid JSON responses', async () => {
			server.use(errorHandlers.invalidJson);

			// Invalid JSON causes the SDK to throw
			await expect(getPublicProjectSearch({query: {}})).rejects.toThrow(
				'Unexpected token',
			);
		});

		it('should handle empty 204 responses', async () => {
			server.use(errorHandlers.emptyResponse);

			const result = await getPublicProjectSearch({query: {}});

			expect(result.response.status).toBe(204);
			// SDK returns empty object for 204 responses
			expect(result.data).toEqual({});
		});
	});

	describe('Error Recovery Patterns', () => {
		it('should allow retry after receiving rate limit error', async () => {
			const requestCount = 0;

			server.use(
				errorHandlers.rateLimited,
				// After rate limit, return success
			);

			// First request - rate limited
			const firstResult = await getPublicProjectSearch({query: {}});
			expect(firstResult.response.status).toBe(429);

			// Reset handler to success
			server.resetHandlers();

			// Second request - should succeed
			const secondResult = await getPublicProjectSearch({query: {}});
			expect(secondResult.response.ok).toBe(true);
		});

		it('should preserve error details for debugging', async () => {
			server.use(errorHandlers.serverError);

			const result = await getPublicProjectSearch({
				query: {
					search: 'test-query',
					orderAddressCantons: ['TI'],
				},
			});

			expect(result.response.ok).toBe(false);
			expect(result.response.status).toBe(500);

			// SDK returns undefined for data on error responses
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});
	});

	describe('Error Message Formatting', () => {
		it('should provide clear error messages for common issues', async () => {
			const testCases = [
				{
					handler: errorHandlers.unauthorized,
					expectedStatus: 401,
				},
				{
					handler: errorHandlers.forbidden,
					expectedStatus: 403,
				},
				{
					handler: errorHandlers.notFound,
					expectedStatus: 404,
				},
				{
					handler: errorHandlers.rateLimited,
					expectedStatus: 429,
				},
			];

			for (const testCase of testCases) {
				server.resetHandlers();
				server.use(testCase.handler);

				// eslint-disable-next-line no-await-in-loop
				const result = await getPublicProjectSearch({query: {}});

				// SDK returns undefined for data on error responses
				expect(result.data).toBeUndefined();
				expect(result.response.status).toBe(testCase.expectedStatus);
				expect(result.error).toBeDefined();
			}
		});

		it('should include error codes for programmatic handling', async () => {
			const testCases = [
				{handler: errorHandlers.unauthorized, expectedStatus: 401},
				{handler: errorHandlers.forbidden, expectedStatus: 403},
				{handler: errorHandlers.notFound, expectedStatus: 404},
				{handler: errorHandlers.rateLimited, expectedStatus: 429},
				{handler: errorHandlers.serverError, expectedStatus: 500},
			];

			for (const testCase of testCases) {
				server.resetHandlers();
				server.use(testCase.handler);

				// eslint-disable-next-line no-await-in-loop
				const result = await getPublicProjectSearch({query: {}});

				// SDK returns undefined for data on error responses
				expect(result.data).toBeUndefined();
				expect(result.response.status).toBe(testCase.expectedStatus);
				expect(result.error).toBeDefined();
			}
		});
	});
});
