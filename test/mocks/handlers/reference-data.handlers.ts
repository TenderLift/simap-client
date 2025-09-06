import {http, HttpResponse} from 'msw';
// Import the raw JSON fixtures
import cantonsData from '../../fixtures/cantons.json';
import countriesData from '../../fixtures/countries.json';
import languagesData from '../../fixtures/languages.json';
import activitiesData from '../../fixtures/activities.json';

const SIMAP_API_BASE = 'https://www.simap.ch/api';

export const referenceDataHandlers = [
	http.get(`${SIMAP_API_BASE}/cantons/v1`, () => {
		// The cantons endpoint returns the full object with cantons array
		return HttpResponse.json(cantonsData);
	}),

	http.get(`${SIMAP_API_BASE}/countries/v1`, () => {
		return HttpResponse.json(countriesData);
	}),

	http.get(`${SIMAP_API_BASE}/languages/v1`, () => {
		return HttpResponse.json(languagesData);
	}),

	http.get(`${SIMAP_API_BASE}/activities/v1`, () => {
		return HttpResponse.json(activitiesData);
	}),
];
