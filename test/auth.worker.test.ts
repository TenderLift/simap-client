import {beforeAll, afterEach, it, expect, describe} from 'vitest';
import {fetchMock} from 'cloudflare:test';

// Import auth helper
import {withAuth, client} from '../src/index';

beforeAll(() => {
	fetchMock.activate();
	fetchMock.disableNetConnect();
});

afterEach(() => {
	fetchMock.assertNoPendingInterceptors();
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

		// Mock protected endpoint
		fetchMock
			.get('https://www.simap.ch')
			.intercept({
				path: '/api/protected',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.reply(200, JSON.stringify(fixture), {
				headers: {'content-type': 'application/json'},
			});

		client.setConfig({
			baseUrl: 'https://www.simap.ch/api',
		});

		// Make authenticated request
		const response = await client.get({
			url: '/protected',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		expect(response.response.ok).toBe(true);
		expect(response.data).toEqual(fixture);
	});
});
