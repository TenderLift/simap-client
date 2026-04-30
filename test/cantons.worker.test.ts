import {afterEach, it, expect, describe, vi} from 'vitest';
import {client, listCantons, ensureOk, HttpError} from '../src/index';

function mockFetch(
	expectedStatus: number,
	body: unknown,
	checkRequest?: (request: Request) => void,
) {
	const fetchSpy = vi.fn(
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init);
			checkRequest?.(request);
			return new Response(JSON.stringify(body), {
				status: expectedStatus,
				headers: {'Content-Type': 'application/json'},
			});
		},
	);
	vi.stubGlobal('fetch', fetchSpy);
	return fetchSpy;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('SIMAP API Client - Cantons', () => {
	it('lists cantons from SIMAP (stubbed)', async () => {
		const fixture = {
			cantons: [
				{code: 'TI', name: 'Ticino'},
				{code: 'VD', name: 'Vaud'},
				{code: 'GE', name: 'Genève'},
			],
		};

		const fetchSpy = mockFetch(200, fixture);

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		const res = await listCantons();

		expect(fetchSpy).toHaveBeenCalledOnce();
		expect(res.response!.ok).toBe(true);
		expect(res.data).toEqual(fixture);
	});

	it('handles HTTP errors gracefully', async () => {
		const errorResponse = {error: 'Unauthorized'};
		mockFetch(401, errorResponse);

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		const res = await listCantons();

		expect(res.response!.ok).toBe(false);
		expect(res.response!.status).toBe(401);

		try {
			await ensureOk(res);
			expect.fail('ensureOk should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(HttpError);
			if (error instanceof HttpError) {
				expect(error.status).toBe(401);
			}
		}
	});

	it('handles network errors', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new Error('Network error');
			}),
		);

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		const res = await listCantons();

		expect(res.response).toBeUndefined();
		expect(res.error).toBeInstanceOf(Error);
	});
});
