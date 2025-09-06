import {describe, expect, it} from 'vitest';
import {
	listActivities,
	listCantons,
	listCountries,
	listLanguages,
} from '../../src/generated/sdk.gen';

describe('Reference Data API Endpoints', () => {
	it('should fetch the list of cantons', async () => {
		const {data} = await listCantons();
		expect(data?.cantons).toBeInstanceOf(Array);
		expect(data?.cantons.length).toBeGreaterThan(20);
		const ticino = data?.cantons.find((c) => c.id === 'TI');
		expect(ticino?.id).toBe('TI');
	});

	it('should fetch the list of countries', async () => {
		const {data} = await listCountries();
		expect(data?.countries).toBeInstanceOf(Array);
		expect(data?.countries.length).toBeGreaterThan(200);
		const switzerland = data?.countries.find((c) => c.id === 'CH');
		expect(switzerland?.label.de).toBe('Schweiz');
	});

	it('should fetch the list of languages', async () => {
		const {data} = await listLanguages();
		expect(data?.languages).toBeInstanceOf(Array);
		expect(data?.languages.length).toBeGreaterThan(3);
		const italian = data?.languages.find((l) => l.id === 'it');
		expect(italian?.id).toBe('it');
	});

	it('should fetch the list of main activities', async () => {
		const {data} = await listActivities();
		expect(data?.mainActivities).toBeInstanceOf(Array);
		expect(data?.mainActivities.length).toBeGreaterThan(5);
		const publicServices = data?.mainActivities.find(
			(a) => a.id === '831146dd-b9e7-408d-a268-08d788851b09',
		);
		expect(publicServices?.label.de).toBe('Allgemeine öffentliche Verwaltung');
	});
});
