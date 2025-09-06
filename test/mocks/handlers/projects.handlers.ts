import {http, HttpResponse} from 'msw';
import tiProjects from '../../fixtures/project-search-ti.json';
import tiProjectsStrada from '../../fixtures/project-search-ti-strada.json';

const SIMAP_API_BASE = 'https://www.simap.ch/api';

// A distinct mock for the second page to ensure no overlap in tests
const mockSecondPage = {
	...tiProjects,
	projects: [
		{
			id: 'a-completely-different-id-for-page-2',
			projectNumber: '999999',
			title: {it: 'Second Page Project'},
			projectSubType: 'construction',
			projectType: 'CONSTRUCTION',
			processType: 'OPEN',
			publicationDate: '2025-09-01',
			pubType: 'TENDER_NOTICE',
			procOfficeName: {de: 'Muster AG'},
			orderAddress: {cantonId: 'TI', countryId: 'CH'},
		},
	],
	pagination: {
		...tiProjects.pagination,
		lastItem: 'a-different-cursor',
	},
};

export const projectsHandlers = [
	http.get(
		`${SIMAP_API_BASE}/publications/v2/project/project-search`,
		({request}) => {
			const url = new URL(request.url);
			const cantons = url.searchParams.get('orderAddressCantons');
			const searchQuery = url.searchParams.get('search');
			const lastItem = url.searchParams.get('lastItem');

			// Handle empty search results mock
			if (searchQuery === 'xyzxyzxyznotfound123456') {
				return HttpResponse.json({
					projects: [],
					pagination: {itemsPerPage: 20},
				});
			}

			// Handle specific text search for 'strada'
			if (searchQuery === 'strada') {
				return HttpResponse.json(tiProjectsStrada);
			}

			// Handle pagination: return a completely distinct payload for the second page
			if (lastItem) {
				return HttpResponse.json(mockSecondPage);
			}

			// For Ticino, return the real data fixture for the first page.
			if (cantons?.includes('TI')) {
				return HttpResponse.json(tiProjects);
			}

			// Default empty response
			return HttpResponse.json({projects: [], pagination: {itemsPerPage: 20}});
		},
	),

	http.get(
		`${SIMAP_API_BASE}/publications/v2/project/invalid-uuid-format/project-header`,
		() => {
			return HttpResponse.json(
				{
					type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
					title: 'One or more validation errors occurred.',
					status: 400,
					errors: {
						projectId: ["The value 'invalid-uuid-format' is not valid."],
					},
				},
				{status: 400},
			);
		},
	),
];
