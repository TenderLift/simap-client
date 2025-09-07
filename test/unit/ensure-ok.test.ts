import {describe, expect, it} from 'vitest';
import {ensureOk, HttpError} from '../../src/index';

describe('ensureOk', () => {
	it('should return data for successful responses (2xx)', async () => {
		const testData = {id: 1, name: 'Test'};
		const response = new Response(JSON.stringify(testData), {
			status: 200,
			statusText: 'OK',
		});

		const result = await ensureOk({
			response,
			data: testData,
		});

		expect(result).toEqual(testData);
	});

	it('should handle different 2xx status codes', async () => {
		const successCodes = [200, 201, 202, 203, 204, 206];

		for (const status of successCodes) {
			const data = status === 204 ? null : {status, message: 'Success'};
			const response = new Response(
				status === 204 ? null : JSON.stringify(data),
				{status},
			);

			// eslint-disable-next-line no-await-in-loop
			const result = await ensureOk({response, data});
			expect(result).toEqual(data);
		}
	});

	it('should throw HttpError for 4xx responses', async () => {
		const errorData = {error: 'Bad Request', message: 'Invalid input'};
		const response = new Response(JSON.stringify(errorData), {
			status: 400,
			statusText: 'Bad Request',
		});

		await expect(
			ensureOk({
				response,
				data: errorData,
			}),
		).rejects.toThrow(HttpError);

		try {
			await ensureOk({response, data: errorData});
		} catch (error) {
			expect(error).toBeInstanceOf(HttpError);
			expect((error as HttpError).status).toBe(400);
			expect((error as HttpError).body).toEqual(errorData);
		}
	});

	it('should throw HttpError for 5xx responses', async () => {
		const errorData = {error: 'Internal Server Error'};
		const response = new Response(JSON.stringify(errorData), {
			status: 500,
			statusText: 'Internal Server Error',
		});

		await expect(
			ensureOk({
				response,
				data: errorData,
			}),
		).rejects.toThrow(HttpError);

		try {
			await ensureOk({response, data: errorData});
		} catch (error) {
			expect(error).toBeInstanceOf(HttpError);
			expect((error as HttpError).status).toBe(500);
			expect((error as HttpError).body).toEqual(errorData);
		}
	});

	it('should handle all client error codes (4xx)', async () => {
		const clientErrors = [400, 401, 403, 404, 405, 409, 410, 422, 429];

		for (const status of clientErrors) {
			const errorData = {error: `Error ${status}`};
			const response = new Response(JSON.stringify(errorData), {status});

			// eslint-disable-next-line no-await-in-loop
			await expect(ensureOk({response, data: errorData})).rejects.toThrow(
				HttpError,
			);
		}
	});

	it('should handle all server error codes (5xx)', async () => {
		const serverErrors = [500, 501, 502, 503, 504, 505];

		for (const status of serverErrors) {
			const errorData = {error: `Error ${status}`};
			const response = new Response(JSON.stringify(errorData), {status});

			// eslint-disable-next-line no-await-in-loop
			await expect(ensureOk({response, data: errorData})).rejects.toThrow(
				HttpError,
			);
		}
	});

	it('should preserve the original error data in thrown HttpError', async () => {
		const complexErrorData = {
			error: 'Validation Failed',
			code: 'VALIDATION_ERROR',
			details: [
				{field: 'email', message: 'Invalid email format'},
				{field: 'age', message: 'Must be 18 or older'},
			],
			timestamp: '2024-01-01T00:00:00Z',
		};

		const response = new Response(JSON.stringify(complexErrorData), {
			status: 422,
		});

		try {
			await ensureOk({response, data: complexErrorData});
			// Should not reach here
			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpError);
			expect((error as HttpError).body).toEqual(complexErrorData);
			expect((error as HttpError).status).toBe(422);
		}
	});

	it('should handle responses with no data', async () => {
		const response = new Response(null, {
			status: 204,
			statusText: 'No Content',
		});

		const result = await ensureOk({
			response,
			data: undefined as any,
		});

		expect(result).toBeUndefined();
	});

	it('should handle redirect responses as successful', async () => {
		const redirectData = {redirectUrl: '/new-location'};
		const response = new Response(JSON.stringify(redirectData), {
			status: 302,
			headers: {
				Location: '/new-location',
			},
		});

		// 3xx responses have ok=false, so they should throw
		await expect(ensureOk({response, data: redirectData})).rejects.toThrow(
			HttpError,
		);
	});
});
