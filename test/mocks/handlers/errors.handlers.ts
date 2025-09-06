import {http, HttpResponse} from 'msw';

const SIMAP_API_BASE = 'https://www.simap.ch/api';

/**
 * Error handlers for testing error scenarios
 * These can be selectively enabled in tests to simulate various error conditions
 */
export const errorHandlers = {
	// 401 Unauthorized - Missing or invalid authentication
	unauthorized: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Unauthorized',
				message: 'Authentication required',
				code: 'AUTH_REQUIRED',
			},
			{status: 401},
		);
	}),

	// 403 Forbidden - Insufficient permissions
	forbidden: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Forbidden',
				message: 'Insufficient permissions to access this resource',
				code: 'INSUFFICIENT_PERMISSIONS',
			},
			{status: 403},
		);
	}),

	// 404 Not Found
	notFound: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Not Found',
				message: 'The requested resource was not found',
				code: 'RESOURCE_NOT_FOUND',
			},
			{status: 404},
		);
	}),

	// 429 Too Many Requests - Rate limiting
	rateLimited: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Too Many Requests',
				message: 'Rate limit exceeded. Please try again later.',
				code: 'RATE_LIMIT_EXCEEDED',
				retryAfter: 60,
			},
			{
				status: 429,
				headers: {
					'Retry-After': '60',
				},
			},
		);
	}),

	// 500 Internal Server Error
	serverError: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Internal Server Error',
				message: 'An unexpected error occurred',
				code: 'INTERNAL_ERROR',
				traceId: 'trace-' + Math.random().toString(36).slice(2, 11),
			},
			{status: 500},
		);
	}),

	// 502 Bad Gateway
	badGateway: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Bad Gateway',
				message: 'The upstream server is unavailable',
				code: 'GATEWAY_ERROR',
			},
			{status: 502},
		);
	}),

	// 503 Service Unavailable - Maintenance mode
	serviceUnavailable: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Service Unavailable',
				message: 'The service is temporarily unavailable for maintenance',
				code: 'SERVICE_MAINTENANCE',
				estimatedDowntime: '2 hours',
			},
			{
				status: 503,
				headers: {
					'Retry-After': '7200',
				},
			},
		);
	}),

	// Network error - Connection timeout
	networkError: http.get(`${SIMAP_API_BASE}/*`, () => {
		// Simulate network failure
		return HttpResponse.error();
	}),

	// Invalid JSON response
	invalidJson: http.get(`${SIMAP_API_BASE}/*`, () => {
		return new HttpResponse('This is not valid JSON', {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}),

	// Empty response
	emptyResponse: http.get(`${SIMAP_API_BASE}/*`, () => {
		return new HttpResponse(null, {status: 204});
	}),

	// Validation error - 400 Bad Request
	validationError: http.post(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				error: 'Validation Error',
				message: 'The request contains invalid data',
				code: 'VALIDATION_ERROR',
				details: [
					{
						field: 'canton',
						message: 'Invalid canton code',
						value: 'XX',
					},
					{
						field: 'dateFrom',
						message: 'Date must be in the future',
						value: '2020-01-01',
					},
				],
			},
			{status: 400},
		);
	}),
};

/**
 * Helper function to create custom error handlers for specific endpoints
 */
export function createErrorHandler(
	endpoint: string,
	status: number,
	errorBody: any,
) {
	return http.get(`${SIMAP_API_BASE}${endpoint}`, () => {
		return HttpResponse.json(errorBody, {status});
	});
}
