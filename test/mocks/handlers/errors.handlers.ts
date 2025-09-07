import {http, HttpResponse} from 'msw';

const SIMAP_API_BASE = 'https://www.simap.ch/api';

/**
 * Error handlers for testing error scenarios
 * These can be selectively enabled in tests to simulate various error conditions
 */
export const errorHandlers = {
	// 401 Unauthorized - Missing or invalid authentication (SIMAP format)
	unauthorized: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				message: 'Authentication required',
				path: '/api/publications/v2/project/project-search',
				status: 401,
				timestamp: new Date().toISOString(),
				errorCode: 'UNAUTHORIZED',
			},
			{status: 401},
		);
	}),

	// 403 Forbidden - Insufficient permissions (SIMAP format)
	forbidden: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				message: 'Insufficient permissions to access this resource',
				path: '/api/publications/v2/project/project-search',
				status: 403,
				timestamp: new Date().toISOString(),
				errorCode: 'FORBIDDEN',
			},
			{status: 403},
		);
	}),

	// 404 Not Found (SIMAP format)
	notFound: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				message: 'The requested resource was not found',
				path: '/api/publications/v2/project/non-existent-id/project-header',
				status: 404,
				timestamp: new Date().toISOString(),
				errorCode: 'NOT_FOUND',
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

	// 500 Internal Server Error (SIMAP format)
	serverError: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				message: 'An unexpected error occurred',
				path: '/api/publications/v2/project/project-search',
				status: 500,
				timestamp: new Date().toISOString(),
				errorCode: 'INTERNAL_SERVER_ERROR',
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
				message:
					'The service is temporarily unavailable for maintenance',
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

	// Validation error - 400 Bad Request (SIMAP format)
	validationError: http.get(`${SIMAP_API_BASE}/*`, () => {
		return HttpResponse.json(
			{
				message: 'The request contains invalid data',
				path: '/api/publications/v2/project/project-search',
				status: 400,
				timestamp: new Date().toISOString(),
				errorCode: 'VALIDATION_ERROR',
				missingFields: ['canton', 'dateFrom'],
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
