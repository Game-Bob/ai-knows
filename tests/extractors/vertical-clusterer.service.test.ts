import { describe, expect, it } from 'vitest';
import { VerticalClustererService } from '../../src/extractors/search-suggest/vertical-clusterer.service.js';

describe('VerticalClustererService', () => {
    const clusterer = new VerticalClustererService();

    it('clusters non-existing domains into new vertical candidates', () => {
        const rawQueries = [
            'calculator for aquarium volume in gallons',
            'online calculator for aquarium salinity',
            'calculator for solar panel angle',
            'estimator for solar battery bank',
            'calculator for drone battery c rating'
        ];

        const clusters = clusterer.cluster(rawQueries);

        const aquarium = clusters.find((c) => c.verticalKey === 'aquarium');
        expect(aquarium).toBeDefined();
        expect(aquarium?.suggestedRepoName).toBe('jjlmoya-utils-aquarium');
        expect(aquarium?.totalOpportunities).toBe(2);

        const solar = clusters.find((c) => c.verticalKey === 'solar');
        expect(solar).toBeDefined();
        expect(solar?.suggestedRepoName).toBe('jjlmoya-utils-solar');

        const drone = clusters.find((c) => c.verticalKey === 'drones' || c.verticalKey === 'drone');
        expect(drone).toBeUndefined();
    });
});
