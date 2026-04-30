import {afterEach, it, expect, describe, vi} from 'vitest';
import {withAuth, client} from '../src/index';

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

describe('Authentication Helper', () => {
	it('adds Bearer token to headers', () => {
		const token = 'test-token-123';
		const authInit = withAuth({token})();

		expect(authInit.headers).toBeDefined();
		expect((authInit.headers as Record<string, string>).Authorization).toBe(
			`Bearer ${token}`,
		);
	});

	it('preserves existing headers', () => {
		const token = 'test-token-456';
		const existingInit: RequestInit = {
			headers: {
				'X-Custom-Header': 'custom-value',
				'Content-Type': 'application/json',
			},
		};

		const authInit = withAuth({token})(existingInit);
		const headers = authInit.headers as Record<string, string>;

		expect(headers['X-Custom-Header']).toBe('custom-value');
		expect(headers['Content-Type']).toBe('application/json');
		expect(headers.Authorization).toBe(`Bearer ${token}`);
	});

	it('works with empty auth object', () => {
		const authInit = withAuth({})();

		expect(authInit.headers).toBeDefined();
		expect(
			(authInit.headers as Record<string, string>).Authorization,
		).toBeUndefined();
	});

	it('sends authenticated request through client', async () => {
		const token = 'secret-token';
		const fixture = {protected: 'data'};

		const fetchSpy = mockFetch(200, fixture, (request) => {
			expect(request.headers.get('Authorization')).toBe(
				`Bearer ${token}`,
			);
		});

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		const response = await client.get({
			url: '/protected',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		expect(fetchSpy).toHaveBeenCalledOnce();
		expect(response.response!.ok).toBe(true);
		expect(response.data).toEqual(fixture);
	});
});
