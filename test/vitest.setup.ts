import {beforeAll, afterEach, afterAll} from 'vitest';
import {client} from '../src/generated/client.gen';
import {server} from './mocks/server';

// Configure the client for all tests
beforeAll(() => {
	client.setConfig({
		baseUrl: 'https://www.simap.ch/api',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	});

	// Start MSW
	server.listen({onUnhandledRequest: 'error'});
});

// Reset any request handlers that we may add during tests,
// so they don't affect other tests.
afterEach(() => {
	server.resetHandlers();
});

// Clean up after the tests are finished.
afterAll(() => {
	server.close();
});
