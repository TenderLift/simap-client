import {describe, expect, it} from 'vitest';
import {HttpError} from '../../src/index';

describe('HttpError', () => {
	it('should create an error with status and body', () => {
		const status = 404;
		const body = {error: 'Not Found', message: 'Resource not found'};
		const error = new HttpError(status, body);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(HttpError);
		expect(error.status).toBe(404);
		expect(error.body).toEqual(body);
	});

	it('should format error message with status code', () => {
		const error = new HttpError(500, 'Internal Server Error');

		expect(error.message).toBe('HTTP 500');
	});

	it('should preserve stack trace', () => {
		const error = new HttpError(403, {error: 'Forbidden'});

		expect(error.stack).toBeDefined();
		expect(error.stack).toContain('HttpError');
	});

	it('should handle different body types', () => {
		// String body
		const stringError = new HttpError(400, 'Bad Request');
		expect(stringError.body).toBe('Bad Request');

		// Object body
		const objectError = new HttpError(422, {
			errors: [{field: 'email', message: 'Invalid email'}],
		});
		expect(objectError.body).toEqual({
			errors: [{field: 'email', message: 'Invalid email'}],
		});

		// Null body
		const nullError = new HttpError(204, null);
		expect(nullError.body).toBeNull();

		// Undefined body
		const undefinedError = new HttpError(500, undefined);
		expect(undefinedError.body).toBeUndefined();
	});

	it('should handle all HTTP error status codes', () => {
		const errorCodes = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503];

		for (const code of errorCodes) {
			const error = new HttpError(code, `Error ${code}`);
			expect(error.status).toBe(code);
			expect(error.message).toBe(`HTTP ${code}`);
		}
	});

	it('should be catchable as an Error', () => {
		const throwError = () => {
			throw new HttpError(404, 'Not Found');
		};

		expect(throwError).toThrow(Error);
		expect(throwError).toThrow(HttpError);
		expect(throwError).toThrow('HTTP 404');
	});

	it('should preserve error name', () => {
		const error = new HttpError(500, {});
		expect(error.name).toBe('HttpError');
	});
});
